import { IVerificationToken } from '../models/verification-token';

export interface IEmailVerificationService {
  createVerificationToken(email: string): Promise<IVerificationToken>;
  useVerificationToken(token: string): Promise<IVerificationToken>;
  deleteToken(token: string): Promise<IVerificationToken | null>;
}
