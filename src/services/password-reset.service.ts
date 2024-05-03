import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IUser } from '../models/user';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { IPasswordResetService } from '../types/IPasswordResetService';
import { IUserService } from '../types/IUserService';

@injectable()
export default class PasswordResetService implements IPasswordResetService {
  private passwordResetRepository: IPasswordResetRepository;
  private userService: IUserService;
  private mailerService: IMailerService;

  constructor(
    @inject(INTERFACE_TYPE.PasswordResetRepository)
    passwordResetRepository: IPasswordResetRepository,
    @inject(INTERFACE_TYPE.UserService) userService: IUserService,
    @inject(INTERFACE_TYPE.MailerService) mailerService: IMailerService
  ) {
    this.passwordResetRepository = passwordResetRepository;
    this.userService = userService;
    this.mailerService = mailerService;
  }
  create(identifier: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  verify(token: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(token: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async reset(email: string): Promise<IUser> {
    if (!email) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const user = await this.userService.getUser({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const resetToken = await this.passwordResetRepository.create(user.email);
    await this.mailerService.sendPasswordResetEmail(user.email, resetToken.token);

    return user;
  }

  async resetConfirm(token: string, password: string): Promise<IUser> {
    if (!token || !password) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const passwordResetToken = await this.passwordResetRepository.find({ token });

    if (!passwordResetToken) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }

    const hasExpired = new Date(passwordResetToken.expiresAt) < new Date();

    if (hasExpired) {
      throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, STATUS_CODES.UNAUTHORIZED);
    }

    const user = await this.userService.getUser({ email: passwordResetToken.identifier });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const updatedUser = await this.userService.updatePassword(user.email, user.password, password);

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    await this.passwordResetRepository.delete(token);

    return updatedUser;
  }
}
