export interface ILoginResponse {
  user: {
    id: string;
    email: string;
  };
  sessionId: string;
}
