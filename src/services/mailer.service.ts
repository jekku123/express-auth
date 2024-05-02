import { injectable } from 'inversify';
import { IMailerService } from '../types/IMailerService';

@injectable()
export default class MailerService implements IMailerService {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const confirmLink = `http://localhost:3000/api/auth/verify-email?token=${token}`;
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

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetLink = `http://localhost:3000/api/auth/reset-password?token=${token}`;
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