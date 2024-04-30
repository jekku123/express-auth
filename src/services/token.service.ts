import { randomUUID } from 'crypto';
import { injectable } from 'inversify';
import { ITokenService, Tokens } from '../types/ITokenService';

@injectable()
export class TokenService implements ITokenService {
  generateToken(expires: string) {
    const token = randomUUID();
    return {
      token,
      expires,
    };
  }

  generateAccessToken() {
    const token = randomUUID();
    // expires in 15 minutes
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      token,
      expires,
    };
  }

  generateRefreshToken() {
    const token = randomUUID();
    // expires in 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    return {
      token,
      expires,
    };
  }

  generateTokens(): Tokens {
    return {
      accessToken: this.generateAccessToken(),
      refreshToken: this.generateRefreshToken(),
    };
  }
}
