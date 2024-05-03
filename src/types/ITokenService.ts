export type TokenPayload = {
  token: any;
  expiresAt: string | Date;
};

export interface ITokenService {
  generateAccessToken(): TokenPayload;
  generateRefreshToken(): TokenPayload;
  verifyToken(token: string): TokenPayload;
}
