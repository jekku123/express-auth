import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../container/dependencies';
import AppError from '../errors/AppError';
import { ERROR_MESSAGES } from '../errors/errorMessages';
import { STATUS_CODES } from '../errors/statusCodes';
import { IPasswordReset } from '../models/password-reset';
import { IUser } from '../models/user';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { IPasswordResetService } from '../types/IPasswordResetService';

@injectable()
export default class PasswordResetService implements IPasswordResetService {
  constructor(
    @inject(INTERFACE_TYPE.PasswordResetRepository)
    private passwordResetRepository: IPasswordResetRepository,

    @inject(INTERFACE_TYPE.MailerService) private mailerService: IMailerService
  ) {}

  async reset(email: string): Promise<any> {
    this.validateEmail(email);

    const resetToken = await this.createResetToken(email);
    await this.sendResetEmail(email, resetToken.token);

    return email;
  }

  async verifyPasswordReset(token: string, password: string): Promise<IUser['email']> {
    this.validateTokenAndPassword(token, password);

    const passwordReset = await this.getPasswordReset(token);
    this.verifyTokenExpiry(passwordReset);

    await this.deleteToken(token);

    return passwordReset.identifier;
  }

  private validateEmail(email: string) {
    if (!email) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async createResetToken(email: string) {
    return await this.passwordResetRepository.create(email);
  }

  private async sendResetEmail(email: string, token: string) {
    await this.mailerService.sendPasswordResetEmail(email, token);
  }

  private validateTokenAndPassword(token: string, password: string) {
    if (!token || !password) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async getPasswordReset(token: string): Promise<IPasswordReset> {
    const passwordReset = await this.passwordResetRepository.find({ token });
    if (!passwordReset) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }
    return passwordReset;
  }

  private verifyTokenExpiry(passwordReset: IPasswordReset) {
    const hasExpired = new Date(passwordReset.expiresAt) < new Date();
    if (hasExpired) {
      throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, STATUS_CODES.UNAUTHORIZED);
    }
  }

  private async deleteToken(token: string) {
    await this.passwordResetRepository.delete(token);
  }
}
