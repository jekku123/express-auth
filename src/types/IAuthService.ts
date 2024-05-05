export type LoginServiceResponse = {
  user: {
    id: string;
    email: string;
  };
};

export interface IAuthService {
  login(email: string, password: string): Promise<LoginServiceResponse>;
}
