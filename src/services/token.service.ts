import crypto from 'crypto';
import { injectable } from 'inversify';
import { ITokenService, TokenPayload } from '../types/ITokenService';

export const ACCESS_TOKEN_DURATION = 1 * 60 * 1000;
export const REFRESH_TOKEN_DURATION = 2 * 60 * 1000;

@injectable()
export default class TokenService implements ITokenService {
  generateAccessToken(): TokenPayload {
    return {
      token: this.generateUniqueString(),
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_DURATION).toISOString(),
    };
  }

  generateRefreshToken(): TokenPayload {
    return {
      token: this.generateUniqueString(),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_DURATION).toISOString(),
    };
  }

  verifyToken(token: string): TokenPayload {
    throw new Error('Method not implemented.');
  }

  private generateUniqueString(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
