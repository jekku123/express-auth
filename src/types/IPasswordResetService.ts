import { IUser } from '../models/user';

export interface IPasswordResetService {
  reset(email: string): Promise<IUser>;
  verifyPasswordReset(token: string, password: string): Promise<IUser['email']>;
}
