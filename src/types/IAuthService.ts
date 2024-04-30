import { Token } from './ITokenService';

export interface IAuthService {
  login(email: string, password: string): Promise<{ accessToken: Token; refreshToken: Token }>;
  logout(refreshToken: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<Token>;
  verifyEmail(userId: string, token: string): Promise<void>;
}
