import { IVerificationToken } from '../models/verification-token';

export interface IEmailVerificationRepository {
  create(identifier: string): Promise<IVerificationToken>;
  delete(token: string): Promise<IVerificationToken>;
  find(data: Partial<IVerificationToken>): Promise<IVerificationToken | null>;
  save(token: IVerificationToken): Promise<IVerificationToken>;
}
