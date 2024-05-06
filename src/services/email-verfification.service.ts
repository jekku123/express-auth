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
/**
 * EmailVerificationService
 * Service for handling email verification operations such as creating and using verification tokens.
 * Interacts with the email verification repository to manage email verification tokens and their usage.
 */
export default class EmailVerificationService implements IEmailVerificationService {
  /**
   * Constructs a new EmailVerificationService.
   * @param emailVerificationRepository - The repository to interact with email verification tokens.
   */
  constructor(
    @inject(INTERFACE_TYPE.EmailVerificationRepository)
    private emailVerificationRepository: IEmailVerificationRepository
  ) {}

  /**
   * Creates an email verification token for the provided email address.
   * Deletes any existing token for the email before creating a new one.
   * @param email - The email address for which to create the verification token.
   * @returns The newly created email verification token.
   * @throws InternalServerError if the token could not be created.
   */
  async createEmailVerification(email: string): Promise<IEmailVerification> {
    await this.deleteExistingToken(email);
    return await this.createNewToken(email);
  }

  /**
   * Uses an email verification token and removes it after usage.
   * @param token - The email verification token to be used.
   * @returns The email verification token used.
   * @throws BadRequestError if the token is invalid.
   * @throws NotFoundError if the token is not found.
   * @throws GoneError if the token has expired.
   * @throws InternalServerError if the token could not be deleted after usage.
   */
  async useEmailVerification(token: string): Promise<IEmailVerification> {
    this.validateToken(token);

    const existingToken = await this.findExistingToken(token);
    this.verifyTokenExpiry(existingToken);

    await this.emailVerificationRepository.delete(existingToken.token);

    return existingToken;
  }

  /**
   * Deletes an existing email verification token for the specified email address.
   * @param email - The email address whose existing token should be deleted.
   * @returns void
   * @throws InternalServerError if the existing token could not be deleted.
   * @private
   */
  private async deleteExistingToken(email: string): Promise<void> {
    const existingToken = await this.emailVerificationRepository.find({ identifier: email });
    if (existingToken) {
      await this.emailVerificationRepository.delete(existingToken.token);
    }
  }

  /**
   * Creates a new email verification token for the specified email address.
   * @param email - The email address for which to create the verification token.
   * @returns The newly created email verification token.
   * @throws InternalServerError if the token could not be created.
   * @private
   */
  private async createNewToken(email: string): Promise<IEmailVerification> {
    const newToken = await this.emailVerificationRepository.create(email);
    if (!newToken) {
      throw new InternalServerError('Email verification token not created', { email });
    }
    return newToken;
  }

  /**
   * Validates the provided token.
   * @param token - The email verification token to validate.
   * @returns void
   * @throws BadRequestError if the token is invalid (empty or null).
   * @private
   */
  private validateToken(token: string) {
    if (!token) {
      throw new BadRequestError(ERROR_MESSAGES.BAD_REQUEST);
    }
  }

  /**
   * Finds the existing email verification token by its token string.
   * @param token - The token string of the email verification token.
   * @returns The existing email verification token.
   * @throws NotFoundError if the token is not found.
   * @private
   */
  private async findExistingToken(token: string): Promise<IEmailVerification> {
    const existingToken = await this.emailVerificationRepository.find({ token });
    if (!existingToken) {
      throw new NotFoundError('Verification token not found');
    }
    return existingToken;
  }

  /**
   * Verifies if the email verification token has expired.
   * @param existingToken - The email verification token to verify.
   * @returns The existing email verification token.
   * @throws GoneError if the token has expired.
   * @private
   */
  private verifyTokenExpiry(existingToken: IEmailVerification): IEmailVerification {
    const hasExpired = existingToken.expiresAt < new Date(Date.now());
    if (hasExpired) {
      throw new GoneError('Verification token has expired');
    }
    return existingToken;
  }

  /**
   * Deletes an email verification token by its token string.
   * @param token - The token string of the email verification token to delete.
   * @returns The deleted email verification token.
   * @throws InternalServerError if the token could not be deleted.
   * @private
   */
  async deleteToken(token: string): Promise<IEmailVerification> {
    const deletedToken = await this.emailVerificationRepository.delete(token);
    if (!deletedToken) {
      throw new InternalServerError('Email verification token not deleted');
    }
    return deletedToken;
  }
}
