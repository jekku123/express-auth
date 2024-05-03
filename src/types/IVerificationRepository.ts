import { IVerificationToken } from '../models/verificationToken';

export interface IVerificationRepository {
  create(identifier: string): Promise<IVerificationToken>;
  delete(token: string): Promise<IVerificationToken | null>;
  find(data: Partial<IVerificationToken>): Promise<IVerificationToken | null>;
}
