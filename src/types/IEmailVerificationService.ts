import { IEmailVerification } from '../models/email-verification';

export interface IEmailVerificationService {
  createEmailVerification(email: string): Promise<IEmailVerification>;
  useEmailVerification(token: string): Promise<IEmailVerification>;
}
