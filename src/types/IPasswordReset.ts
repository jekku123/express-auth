export interface IPasswordReset {
  id: string;
  token: string;
  identifier: string;
  expiresAt: Date;
}
