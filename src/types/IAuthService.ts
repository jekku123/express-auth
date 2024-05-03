export type LoginServiceResponse = {
  user: {
    id: string;
    email: string;
  };
  sessionId: string;
};

export interface IAuthService {
  login(email: string, password: string): Promise<LoginServiceResponse>;
  logout(sessionId: string): Promise<any>;
  verifyEmail(token: string): Promise<void>;
  resetPassword(token: string, password: string): Promise<void>;
}
