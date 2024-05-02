import { IVerificationToken } from '../models/verificationToken';

export interface ITokenService {
  generateVerificationToken(email: string): Promise<IVerificationToken>;
  deleteToken(token: string): Promise<IVerificationToken | null>;
  findTokenByEmail(email: string): Promise<IVerificationToken | null>;
  findTokenByToken(token: string): Promise<IVerificationToken | null>;
}
