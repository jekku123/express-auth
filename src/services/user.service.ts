import { inject, injectable } from 'inversify';

import { ERROR_MESSAGES } from '../errors/error-messages';
import { STATUS_CODES } from '../errors/statusCodes';

import AppError from '../errors/app-error';
import { IUser } from '../models/user';

import { INTERFACE_TYPE } from '../container/dependencies';
import { IEmailVerificationService } from '../types/IEmailVerificationService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetService } from '../types/IPasswordResetService';
import { IUserRepository } from '../types/IUserRepository';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(INTERFACE_TYPE.LoggerService) private loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.MailerService) private mailerService: IMailerService,
    @inject(INTERFACE_TYPE.EmailVerificationService)
    private emailVerificationService: IEmailVerificationService,
    @inject(INTERFACE_TYPE.UserRepository) private userRepository: IUserRepository,
    @inject(INTERFACE_TYPE.PasswordResetService)
    private passwordResetService: IPasswordResetService
  ) {}

  async register(email: string, password: string): Promise<IUser> {
    this.validateRegistrationData(email, password);
    await this.checkIfUserExists(email);

    const hashedPassword = await this.hashPassword(password);
    const user = await this.createUser(email, hashedPassword);

    await this.sendVerificationEmail(email);

    this.loggerService.info(`User with email ${email} registered`, UserService.name);
    return user;
  }

  async getUser(data: Partial<IUser>): Promise<IUser | null> {
    return await this.userRepository.find(data);
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IUser | null> {
    this.validateUpdatePasswordData(userId, oldPassword, newPassword);

    const user = await this.getUserById(userId);
    await this.verifyOldPassword(oldPassword, user.password);

    await this.setNewPassword(user, newPassword);

    this.loggerService.info(`User with email ${user.email} updated password`, UserService.name);

    return user;
  }

  async resetPassword(token: string, password: string): Promise<IUser> {
    const email = await this.passwordResetService.verifyPasswordReset(token, password);
    const user = await this.getUser({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    await this.setNewPassword(user, password);

    this.loggerService.info(`User with email ${user.email} reset password`, UserService.name);

    return user;
  }

  async verifyEmail(token: string): Promise<IUser> {
    this.validateToken(token);

    const verification = await this.emailVerificationService.useEmailVerification(token);
    const existingUser = await this.getUser({ email: verification.identifier });

    if (!existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.INTERNAL_SERVER_ERROR, {
        email: verification.identifier,
      });
    }

    await this.setEmailVerified(existingUser.id);

    return existingUser;
  }

  async forgotPassword(email: string): Promise<void> {
    if (!email) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    this.passwordResetService.reset(email);
  }

  private async setEmailVerified(userId: string): Promise<IUser> {
    const user = await this.userRepository.update(userId, { emailVerified: true });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    this.loggerService.info(`User with id ${userId} email verified`, UserService.name);

    return user;
  }

  private validateRegistrationData(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async checkIfUserExists(email: string) {
    const existingUser = await this.userRepository.find({ email });
    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, STATUS_CODES.CONFLICT, { email });
    }
  }

  private async hashPassword(password: string) {
    return await Bun.password.hash(password);
  }

  private async createUser(email: string, hashedPassword: string): Promise<IUser> {
    const user = await this.userRepository.create(email, hashedPassword);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return user;
  }

  private async sendVerificationEmail(email: string) {
    const { identifier, token } = await this.emailVerificationService.createEmailVerification(
      email
    );
    await this.mailerService.sendVerificationEmail(identifier, token);
  }

  private validateUpdatePasswordData(userId: string, oldPassword: string, newPassword: string) {
    if (!userId || !oldPassword || !newPassword) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async getUserById(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }
    return user;
  }

  private async verifyOldPassword(oldPassword: string, storedPassword: string) {
    const isPasswordValid = await Bun.password.verify(oldPassword, storedPassword);
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }
  }

  private async setNewPassword(user: IUser, newPassword: string) {
    user.password = await Bun.password.hash(newPassword);
    await this.userRepository.save(user);
  }

  private validateToken(token: string) {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
  }
}
