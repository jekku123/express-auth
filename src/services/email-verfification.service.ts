import { inject, injectable } from 'inversify';

import AppError from '../errors/AppError';
import { STATUS_CODES } from '../errors/statusCodes';
import { IVerificationToken } from '../models/email-verification';

import { ERROR_MESSAGES } from '../errors/errorMessages';

import { INTERFACE_TYPE } from '../container/dependencies';
import { IEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IEmailVerificationService } from '../types/IEmailVerificationService';

@injectable()
export default class EmailVerificationService implements IEmailVerificationService {
  constructor(
    @inject(INTERFACE_TYPE.EmailVerificationRepository)
    private emailVerificationRepository: IEmailVerificationRepository
  ) {}

  async createVerificationToken(email: string): Promise<IVerificationToken> {
    await this.deleteExistingToken(email);
    return await this.createNewToken(email);
  }

  async useVerificationToken(token: string): Promise<IVerificationToken> {
    this.validateToken(token);

    const existingToken = await this.findExistingToken(token);
    this.verifyTokenExpiry(existingToken);

    await this.emailVerificationRepository.delete(existingToken.token);

    return existingToken;
  }

  private async deleteExistingToken(email: string): Promise<void> {
    const existingToken = await this.emailVerificationRepository.find({ identifier: email });
    if (existingToken) {
      await this.emailVerificationRepository.delete(existingToken.token);
    }
  }

  private async createNewToken(email: string): Promise<IVerificationToken> {
    const newToken = await this.emailVerificationRepository.create(email);
    if (!newToken) {
      throw new AppError('Token not created', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return newToken;
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
    const deletedToken = await this.emailVerificationRepository.delete(token);
    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return deletedToken;
  }
}
