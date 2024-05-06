export interface IEmailVerification {
  id: string;
  token: string;
  identifier: string;
  expiresAt: Date;
}
