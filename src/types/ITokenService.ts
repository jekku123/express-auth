export type TokenPayload = {
  token: any;
  expiresAt: string | Date;
};

export interface ITokenService {
  generateAccessToken(payload: any): string;
  generateRefreshToken(payload: any): string;
  generateTokens(payload: any): { accessToken: string; refreshToken: string };
  verifyRefreshToken(token: string): any;
  generateSessionId(): TokenPayload;
}
