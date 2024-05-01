import { Token, TokenPayload } from './ITokenService';

export type LoginServiceResponse = {
  user: {
    id: string;
    email: string;
  };
  sessionId: Token;
};

export interface IAuthService {
  login(email: string, password: string): Promise<LoginServiceResponse>;
  logout(sessionId: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<TokenPayload>;
  verifyEmail(userId: string, token: string): Promise<void>;
}
