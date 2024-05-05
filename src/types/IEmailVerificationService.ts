import { IVerificationToken } from '../models/email-verification';

export interface IEmailVerificationService {
  createVerificationToken(email: string): Promise<IVerificationToken>;
  useVerificationToken(token: string): Promise<IVerificationToken>;
}
