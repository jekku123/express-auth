export type Token = {
  token: string;
  expires: string;
};

export type Tokens = {
  accessToken: Token;
  refreshToken: Token;
};

export interface ITokenService {
  generateToken(expires: string): Token;
  generateAccessToken(): Token;
  generateRefreshToken(): Token;
  generateTokens(): Tokens;
}
