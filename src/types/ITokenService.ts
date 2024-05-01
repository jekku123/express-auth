export type Token = string;
export type TokenPayload = {
  token: Token;
  expires: string;
};

export interface ITokenService {
  generateSessionToken(): TokenPayload;
}
