import { inject, injectable } from 'inversify';

import { INTERFACE_TYPE } from '../container/dependencies';
import { UnauthorizedError } from '../errors/auth-error';
import { BadRequestError, NotFoundError } from '../errors/client-error';
import { ERROR_MESSAGES } from '../errors/error-messages';
import { InternalServerError } from '../errors/server-error';
import { IPasswordReset } from '../models/password-reset';
import { IUser } from '../models/user';
import { IMailerService } from '../types/IMailerService';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { IPasswordResetService } from '../types/IPasswordResetService';

@injectable()
/**
 * PasswordResetService
 * Service for managing password reset operations, including creating reset tokens and verifying password resets.
 * Interacts with the password reset repository to handle operations related to password reset tokens.
 */
export default class PasswordResetService implements IPasswordResetService {
  /**
   * Constructs a new PasswordResetService.
   * @param passwordResetRepository - The repository to interact with password reset tokens.
   * @param mailerService - The mailer service to send password reset emails.
   */
  constructor(
    @inject(INTERFACE_TYPE.PasswordResetRepository)
    private passwordResetRepository: IPasswordResetRepository,
    @inject(INTERFACE_TYPE.MailerService) private mailerService: IMailerService
  ) {}

  /**
   * Creates a password reset token and sends a reset email to the provided email address.
   * @param email - The email address to which the password reset email should be sent.
   * @returns The email address for which the password reset token was created.
   * @throws BadRequestError if the email address is invalid.
   */
  async reset(email: string): Promise<any> {
    this.validateEmail(email);

    const resetToken = await this.createResetToken(email);
    await this.sendResetEmail(email, resetToken.token);

    return email;
  }

  /**
   * Verifies the password reset process using the provided token and new password.
   * @param token - The password reset token to verify.
   * @param password - The new password to set for the user.
   * @returns The email address associated with the token.
   * @throws BadRequestError if either the token or password is missing.
   * @throws NotFoundError if the token is not found.
   * @throws UnauthorizedError if the token has expired.
   */
  async verifyPasswordReset(token: string, password: string): Promise<IUser['email']> {
    this.validateTokenAndPassword(token, password);

    const passwordReset = await this.getPasswordReset(token);
    this.verifyTokenExpiry(passwordReset);

    await this.deleteToken(token);

    return passwordReset.identifier;
  }

  /**
   * Validates the provided email address.
   * @param email - The email address to validate.
   * @throws BadRequestError if the email address is invalid.
   * @private
   */
  private validateEmail(email: string) {
    if (!email) {
      throw new BadRequestError(ERROR_MESSAGES.MISSING_EMAIL);
    }
  }

  /**
   * Creates a password reset token for the provided email address.
   * @param email - The email address for which to create the password reset token.
   * @returns The created password reset token.
   * @private
   */
  private async createResetToken(email: string) {
    return await this.passwordResetRepository.create(email);
  }

  /**
   * Sends a password reset email to the provided email address.
   * @param email - The email address to send the password reset email to.
   * @param token - The password reset token to include in the email.
   * @private
   */
  private async sendResetEmail(email: string, token: string) {
    await this.mailerService.sendPasswordResetEmail(email, token);
  }

  /**
   * Validates the provided token and password.
   * @param token - The password reset token to validate.
   * @param password - The new password to validate.
   * @throws BadRequestError if either the token or password is missing.
   * @private
   */
  private validateTokenAndPassword(token: string, password: string) {
    if (!token || !password) {
      throw new BadRequestError(ERROR_MESSAGES.BAD_REQUEST);
    }
  }

  /**
   * Retrieves a password reset token by its token string.
   * @param token - The password reset token string.
   * @returns The password reset token.
   * @throws NotFoundError if the token is not found.
   * @private
   */
  private async getPasswordReset(token: string): Promise<IPasswordReset> {
    const passwordReset = await this.passwordResetRepository.find({ token });
    if (!passwordReset) {
      throw new NotFoundError(ERROR_MESSAGES.TOKEN_NOT_FOUND);
    }
    return passwordReset;
  }

  /**
   * Verifies if the password reset token has expired.
   * @param passwordReset - The password reset token to verify.
   * @throws UnauthorizedError if the token has expired.
   * @private
   */
  private verifyTokenExpiry(passwordReset: IPasswordReset) {
    const hasExpired = new Date(passwordReset.expiresAt) < new Date();
    if (hasExpired) {
      throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
  }

  /**
   * Deletes a password reset token by its token string.
   * @param token - The password reset token string.
   * @returns The deleted password reset token.
   * @throws InternalServerError if the token could not be deleted.
   * @private
   */
  private async deleteToken(token: string) {
    const deletedToken = await this.passwordResetRepository.delete(token);
    if (!deletedToken) {
      throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
    return deletedToken;
  }
}
