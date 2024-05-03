import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IVerificationToken } from '../models/verification-token';

import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { IEmailEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IEmailVerificationService } from '../types/IEmailVerificationService';

@injectable()
export default class EmailVerificationService implements IEmailVerificationService {
  private emailVerificationRepository: IEmailEmailVerificationRepository;

  constructor(
    @inject(INTERFACE_TYPE.EmailVerificationRepository)
    emailVerificationRepository: IEmailEmailVerificationRepository
  ) {
    this.emailVerificationRepository = emailVerificationRepository;
  }
  async createVerificationToken(email: string): Promise<IVerificationToken> {
    const existingToken = await this.emailVerificationRepository.find({ identifier: email });

    if (existingToken) {
      await this.emailVerificationRepository.delete(existingToken.token);
    }

    const verificationToken = this.emailVerificationRepository.create(email);

    return verificationToken;
  }

  async useVerificationToken(token: string): Promise<IVerificationToken> {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const existingToken = await this.emailVerificationRepository.find({ token });

    if (!existingToken) {
      throw new AppError('Verification token not found', STATUS_CODES.NOT_FOUND);
    }

    const hasExpired = existingToken.expiresAt < new Date(Date.now());

    if (hasExpired) {
      throw new AppError('Verification token expired', STATUS_CODES.UNAUTHORIZED);
    }

    await this.emailVerificationRepository.delete(existingToken.token);

    return existingToken;
  }

  async deleteToken(token: string): Promise<IVerificationToken> {
    const deletedToken = await this.emailVerificationRepository.delete(token);

    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return deletedToken;
  }
}
