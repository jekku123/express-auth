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
}
