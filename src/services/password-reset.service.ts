import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IPasswordResetToken } from '../models/password-reset-token';
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
    try {
      this.validateEmail(email);

      const resetToken = await this.createResetToken(email);
      await this.sendResetEmail(email, resetToken.token);

      return email;
    } catch (error) {
      throw error;
    }
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

  async verifyPasswordResetToken(token: string, password: string): Promise<IUser['email']> {
    try {
      this.validateTokenAndPassword(token, password);

      const passwordResetToken = await this.getPasswordResetToken(token);
      this.verifyTokenExpiry(passwordResetToken);

      await this.deleteToken(token);
      return passwordResetToken.identifier;
    } catch (error) {
      throw error;
    }
  }

  private validateTokenAndPassword(token: string, password: string) {
    if (!token || !password) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async getPasswordResetToken(token: string): Promise<IPasswordResetToken> {
    const passwordResetToken = await this.passwordResetRepository.find({ token });
    if (!passwordResetToken) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }
    return passwordResetToken;
  }

  private verifyTokenExpiry(passwordResetToken: IPasswordResetToken) {
    const hasExpired = new Date(passwordResetToken.expiresAt) < new Date();
    if (hasExpired) {
      throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, STATUS_CODES.UNAUTHORIZED);
    }
  }

  private async deleteToken(token: string) {
    await this.passwordResetRepository.delete(token);
  }
}
