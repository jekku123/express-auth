import { IUser } from '../models/user';

export interface IPasswordResetService {
  reset(email: string): Promise<IUser>;
  verifyPasswordResetToken(token: string, password: string): Promise<IUser['email']>;
}
