import { injectable } from 'inversify';
import { IMailerService } from '../types/IMailerService';

const BASE_URL = Bun.env.BASE_URL;

/**
 * Mailer service
 * Service for sending emails to users.
 * Provides methods for sending verification and password reset emails.
 */
@injectable()
export default class MailerService implements IMailerService {
  /**
   * Sends a verification email to the provided email address.
   * @param to - The email address to which the verification email should be sent.
   * @param token - The verification token to include in the email.
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const confirmLink = `${BASE_URL}/api/user/verify-email?token=${token}`;
    console.log(
      'SendVerificationEmail',
      JSON.stringify(
        {
          from: 'keke@keke.com',
          to,
          subject: 'Please visit the link to confirm your account',
          html: `Click <a href="${confirmLink}">here</a> to confirm your account.`,
        },
        null,
        2
      )
    );
  }

  /**
   * Sends a password reset email to the provided email address.
   * @param to - The email address to which the password reset email should be sent.
   * @param token - The password reset token to include in the email.
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `${BASE_URL}/api/user/reset-password?token=${token}`;
    console.log(
      'SendPasswordResetEmail',
      JSON.stringify(
        {
          from: 'keke@keke.com',
          to,
          subject: 'Please visit the link to reset your password',
          html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
        },
        null,
        2
      )
    );
  }
}
