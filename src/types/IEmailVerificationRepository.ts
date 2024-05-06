import { IEmailVerification } from '../models/email-verification';

export interface IEmailVerificationRepository {
  create(identifier: string): Promise<IEmailVerification>;
  delete(token: string): Promise<IEmailVerification>;
  find(data: Partial<IEmailVerification>): Promise<IEmailVerification | null>;
}
