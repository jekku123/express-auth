import { inject, injectable } from 'inversify';

import { IEmailVerification } from '../models/email-verification';

import { ERROR_MESSAGES } from '../errors/error-messages';

import { INTERFACE_TYPE } from '../container/dependencies';
import { GoneError } from '../errors/auth-error';
import { BadRequestError, NotFoundError } from '../errors/client-error';
import { InternalServerError } from '../errors/server-error';
import { IEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IEmailVerificationService } from '../types/IEmailVerificationService';

@injectable()
export default class EmailVerificationService implements IEmailVerificationService {
  constructor(
    @inject(INTERFACE_TYPE.EmailVerificationRepository)
    private emailVerificationRepository: IEmailVerificationRepository
  ) {}

  async createEmailVerification(email: string): Promise<IEmailVerification> {
    await this.deleteExistingToken(email);
    return await this.createNewToken(email);
  }

  async useEmailVerification(token: string): Promise<IEmailVerification> {
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

  private async createNewToken(email: string): Promise<IEmailVerification> {
    const newToken = await this.emailVerificationRepository.create(email);
    if (!newToken) {
      throw new InternalServerError('Email verification token not created', { email });
    }
    return newToken;
  }

  private validateToken(token: string) {
    if (!token) {
      throw new BadRequestError(ERROR_MESSAGES.BAD_REQUEST);
    }
  }

  private async findExistingToken(token: string): Promise<IEmailVerification> {
    const existingToken = await this.emailVerificationRepository.find({ token });
    if (!existingToken) {
      throw new NotFoundError('Verification token not found');
    }
    return existingToken;
  }

  private verifyTokenExpiry(existingToken: IEmailVerification) {
    const hasExpired = existingToken.expiresAt < new Date(Date.now());
    if (hasExpired) {
      throw new GoneError('Verification token has expired');
    }
  }

  async deleteToken(token: string): Promise<IEmailVerification> {
    const deletedToken = await this.emailVerificationRepository.delete(token);
    if (!deletedToken) {
      throw new InternalServerError('Email verification token not deleted');
    }
    return deletedToken;
  }
}
