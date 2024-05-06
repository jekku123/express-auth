import { inject, injectable } from 'inversify';

import { ERROR_MESSAGES } from '../errors/error-messages';

import { IUser } from '../models/user';

import { INTERFACE_TYPE } from '../container/dependencies';
import { UnauthorizedError } from '../errors/auth-error';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/client-error';
import { InternalServerError } from '../errors/server-error';
import { IEmailVerificationService } from '../types/IEmailVerificationService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetService } from '../types/IPasswordResetService';
import { IRegisterResponse } from '../types/IRegisterResponse';
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

  async register(email: string, password: string): Promise<IRegisterResponse> {
    this.validateRegistrationData(email, password);
    await this.checkIfUserExists(email);

    const hashedPassword = await this.hashPassword(password);
    const user = await this.createUser(email, hashedPassword);

    await this.sendVerificationEmail(email);

    this.loggerService.info(`User with email ${email} registered`, UserService.name);

    return this.registerResponse(user);
  }

  async findUser(data: Partial<IUser>): Promise<IUser> {
    const user = await this.userRepository.find(data);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, data);
    }
    return user;
  }

  async findUserById(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, { userId });
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<IUser> {
    const user = await this.findUser({ email });
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, { email });
    }
    return user;
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IUser | null> {
    this.validateUpdatePasswordData(userId, oldPassword, newPassword);

    const user = await this.findUserById(userId);
    await this.verifyPassword(oldPassword, user.password);

    await this.setNewPassword(user.id, newPassword);

    this.loggerService.info(`User with email ${user.email} updated password`, UserService.name);

    return user;
  }

  async resetPassword(token: string, password: string): Promise<IUser> {
    const email = await this.passwordResetService.verifyPasswordReset(token, password);
    const user = await this.findUserByEmail(email);

    await this.setNewPassword(user.id, password);

    this.loggerService.info(`User with email ${user.email} reset password`, UserService.name);

    return user;
  }

  async verifyEmail(token: string): Promise<IUser> {
    this.validateToken(token);

    const verification = await this.emailVerificationService.useEmailVerification(token);
    const existingUser = await this.findUserByEmail(verification.identifier);

    await this.setEmailVerified(existingUser.id);

    return existingUser;
  }

  async forgotPassword(email: string): Promise<void> {
    if (!email) {
      throw new BadRequestError(ERROR_MESSAGES.MISSING_EMAIL);
    }

    this.passwordResetService.reset(email);
  }

  private async setEmailVerified(userId: string): Promise<IUser> {
    const user = await this.userRepository.update(userId, { emailVerified: true });
    if (!user) {
      throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }

    this.loggerService.info(`User with id ${userId} email verified`, UserService.name);

    return user;
  }

  private validateRegistrationData(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestError(ERROR_MESSAGES.MISSING_CREDENTIALS);
    }
  }

  private async checkIfUserExists(email: string) {
    const existingUser = await this.userRepository.find({ email });
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.USER_EXISTS, { email });
    }
  }

  private async hashPassword(password: string) {
    return await Bun.password.hash(password);
  }

  private async createUser(email: string, hashedPassword: string): Promise<IUser> {
    const user = await this.userRepository.create(email, hashedPassword);
    if (!user) {
      throw new InternalServerError(ERROR_MESSAGES.USER_NOT_CREATED);
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
      throw new BadRequestError(ERROR_MESSAGES.MISSING_CREDENTIALS);
    }
  }

  private async verifyPassword(oldPassword: string, storedPassword: string) {
    const isPasswordValid = await Bun.password.verify(oldPassword, storedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_PASSWORD);
    }
  }

  private async setNewPassword(userId: string, newPassword: string) {
    const hashedPassword = await this.hashPassword(newPassword);
    const updatedUser = await this.userRepository.update(userId, { password: hashedPassword });
    if (!updatedUser) {
      throw new InternalServerError(ERROR_MESSAGES.PASSWORD_NOT_UPDATED);
    }
  }

  private validateToken(token: string) {
    if (!token) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  private registerResponse(user: IUser): IRegisterResponse {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
