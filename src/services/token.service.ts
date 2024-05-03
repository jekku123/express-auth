import crypto from 'crypto';
import { injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../types/ITokenService';

export const ACCESS_TOKEN_DURATION = 1 * 60 * 1000;
export const REFRESH_TOKEN_DURATION = 2 * 60 * 1000;
export const SESSION_TOKEN_DURATION = 2 * 60 * 1000;
export const ACCESS_TOKEN_SECRET = Bun.env.ACCESS_TOKEN_SECRET || 'secret';
export const REFRESH_TOKEN_SECRET = Bun.env.REFRESH_TOKEN_SECRET || 'secret';

@injectable()
export default class TokenService implements ITokenService {
  generateSessionId(): TokenPayload {
    return {
      token: TokenService.generateUniqueString(),
      expiresAt: this.setExpiresAt(SESSION_TOKEN_DURATION).toISOString(),
    };
  }

  generateAccessToken(payload: JwtPayload): string {
    return this.signJwt(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_DURATION });
  }

  generateRefreshToken(payload: any): string {
    return this.signJwt(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_DURATION });
  }

  verifyRefreshToken(token: string): any {
    return this.verifyJwt(token, REFRESH_TOKEN_SECRET);
  }

  generateTokens(payload: any): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  static generateUniqueString(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private setExpiresAt(duration: number): Date {
    return new Date(Date.now() + duration);
  }

  private signJwt(payload: any, secret: string, options?: any): string {
    return jwt.sign(payload, secret, options);
  }

  private verifyJwt(token: string, secret: string): any {
    return jwt.verify(token, secret);
  }
}
