import crypto from 'crypto';
import { injectable } from 'inversify';
import { ITokenService } from '../types/ITokenService';

@injectable()
export class TokenService implements ITokenService {
  // 15 minutes
  public static SESSION_TOKEN_EXPIRES = 15 * 60 * 1000;

  // 7 days
  private refreshTokenExpires = 7 * 24 * 60 * 60 * 1000;

  generateSessionToken() {
    const rand64 = crypto.randomBytes(64).toString('base64');
    const expires = new Date(Date.now() + TokenService.SESSION_TOKEN_EXPIRES).toISOString();

    return {
      token: rand64,
      expires,
    };
  }
}
