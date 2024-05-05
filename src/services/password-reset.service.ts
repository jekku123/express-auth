import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../container/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IUser } from '../models/user';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { IPasswordResetService } from '../types/IPasswordResetService';

@injectable()
export default class PasswordResetService implements IPasswordResetService {
  private passwordResetRepository: IPasswordResetRepository;
  private mailerService: IMailerService;

  constructor(
    @inject(INTERFACE_TYPE.PasswordResetRepository)
    passwordResetRepository: IPasswordResetRepository,
    @inject(INTERFACE_TYPE.MailerService) mailerService: IMailerService
  ) {
    this.passwordResetRepository = passwordResetRepository;
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

  async reset(email: string): Promise<any> {
    if (!email) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const resetToken = await this.passwordResetRepository.create(email);
    await this.mailerService.sendPasswordResetEmail(email, resetToken.token);

    return email;
  }

  async verifyPasswordResetToken(token: string, password: string): Promise<IUser['email']> {
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

    await this.passwordResetRepository.delete(token);

    return passwordResetToken.identifier;
  }
}
