import { IVerificationToken } from '../models/email-verification';

export interface IEmailVerificationRepository {
  create(identifier: string): Promise<IVerificationToken>;
  delete(token: string): Promise<IVerificationToken>;
  find(data: Partial<IVerificationToken>): Promise<IVerificationToken | null>;
}
