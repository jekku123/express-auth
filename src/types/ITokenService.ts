import { IVerificationToken } from '../models/verificationToken';

export interface ITokenService {
  generateToken(email: string): Promise<IVerificationToken>;
  verifyToken(token: string): boolean;
  getTokenByToken(token: string): any;
  getTokenByEmail(email: string): any;
  deleteToken(token: string): any;
}
