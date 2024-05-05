import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IVerificationToken } from '../models/verification-token';

import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { IEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IEmailVerificationService } from '../types/IEmailVerificationService';

@injectable()
export default class EmailVerificationService implements IEmailVerificationService {
  constructor(
    @inject(INTERFACE_TYPE.EmailVerificationRepository)
    private emailVerificationRepository: IEmailVerificationRepository
  ) {}

  async createVerificationToken(email: string): Promise<IVerificationToken> {
    try {
      await this.deleteExistingToken(email);
      return await this.createNewToken(email);
    } catch (error) {
      throw error;
    }
  }

  private async deleteExistingToken(email: string) {
    const existingToken = await this.emailVerificationRepository.find({ identifier: email });
    if (existingToken) {
      await this.emailVerificationRepository.delete(existingToken.token);
    }
  }

  private async createNewToken(email: string): Promise<IVerificationToken> {
    return await this.emailVerificationRepository.create(email);
  }

  async useVerificationToken(token: string): Promise<IVerificationToken> {
    try {
      this.validateToken(token);
      const existingToken = await this.findExistingToken(token);
      this.verifyTokenExpiry(existingToken);

      await this.emailVerificationRepository.delete(existingToken.token);
      return existingToken;
    } catch (error) {
      throw error;
    }
  }

  private validateToken(token: string) {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async findExistingToken(token: string): Promise<IVerificationToken> {
    const existingToken = await this.emailVerificationRepository.find({ token });
    if (!existingToken) {
      throw new AppError('Verification token not found', STATUS_CODES.NOT_FOUND);
    }
    return existingToken;
  }

  private verifyTokenExpiry(existingToken: IVerificationToken) {
    const hasExpired = existingToken.expiresAt < new Date(Date.now());
    if (hasExpired) {
      throw new AppError('Verification token expired', STATUS_CODES.UNAUTHORIZED);
    }
  }

  async deleteToken(token: string): Promise<IVerificationToken> {
    try {
      return await this.emailVerificationRepository.delete(token);
    } catch (error) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }
}
