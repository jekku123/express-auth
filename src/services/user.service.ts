import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../config/dependencies';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';

import AppError from '../config/errors/AppError';
import { IUser } from '../models/user';

import { IEmailVerificationService } from '../types/IEmailVerificationService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetService } from '../types/IPasswordResetService';
import { IUserRepository } from '../types/IUserRepository';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserService implements IUserService {
  private loggerService: ILoggerService;
  private mailerService: IMailerService;
  private emailVerificationService: IEmailVerificationService;
  private userRepository: IUserRepository;
  private passwordResetService: IPasswordResetService;

  constructor(
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.MailerService) mailerService: IMailerService,
    @inject(INTERFACE_TYPE.EmailVerificationService)
    emailVerificationService: IEmailVerificationService,
    @inject(INTERFACE_TYPE.UserRepository) userRepository: IUserRepository,
    @inject(INTERFACE_TYPE.PasswordResetService) passwordResetService: IPasswordResetService
  ) {
    this.loggerService = loggerService;
    this.mailerService = mailerService;
    this.emailVerificationService = emailVerificationService;
    this.userRepository = userRepository;
    this.passwordResetService = passwordResetService;
  }

  async register(email: string, password: string): Promise<IUser> {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const existingUser = await this.userRepository.findOne({ email });

    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT, { email });
    }

    const user = await this.userRepository.create(email, password);

    const { identifier, token } = await this.emailVerificationService.createVerificationToken(
      email
    );

    await this.mailerService.sendVerificationEmail(identifier, token);

    this.loggerService.info(`User with email ${email} registered`, UserService.name);

    return user;
  }

  async getUser(data: Partial<IUser>): Promise<IUser | null> {
    const user = await this.userRepository.findOne(data);
    return user;
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IUser | null> {
    if (!userId || !oldPassword || !newPassword) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ _id: userId });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const isPasswordValid = await Bun.password.verify(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    user.password = await Bun.password.hash(newPassword);

    const savedUser = await this.userRepository.save(user);

    if (!savedUser) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    this.loggerService.info(`User with email ${user.email} updated password`, UserService.name);

    return savedUser;
  }

  async resetPassword(token: string, password: string): Promise<IUser> {
    if (!token || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const identifier = await this.passwordResetService.verifyPasswordResetToken(token, password);
    const user = await this.getUser({ email: identifier });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    user.password = await Bun.password.hash(password);

    await this.userRepository.save(user);

    this.loggerService.info(`User with email ${user.email} reseted password`, UserService.name);

    return user;
  }

  async setEmailVerified(userId: string): Promise<IUser> {
    const user = await this.userRepository.update(userId, { emailVerified: true });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    this.loggerService.info(`User with id ${userId} email verified`, UserService.name);

    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const isValid = await Bun.password.verify(password, hashedPassword);
    if (!isValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }
    return isValid;
  }

  async verifyEmail(token: string): Promise<IUser> {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const verification = await this.emailVerificationService.useVerificationToken(token);
    const existingUser = await this.getUser({ email: verification.identifier });

    if (!existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.INTERNAL_SERVER_ERROR, {
        email: verification.identifier,
      });
    }

    await this.setEmailVerified(existingUser._id);

    return existingUser;
  }

  async forgotPassword(email: string): Promise<void> {
    if (!email) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    this.passwordResetService.reset(email);
  }
}
