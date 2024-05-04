import { IUser } from '../models/user';

export interface IUserService {
  register(email: string, password: string): Promise<IUser>;
  updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser | null>;
  getUser(data: Partial<IUser>): Promise<IUser | null>;
  setEmailVerified(userId: string): Promise<IUser | null>;
  verifyEmail(email: string): Promise<IUser>;
  resetPassword(userId: string, password: string): Promise<IUser>;
  forgotPassword(email: string): Promise<void>;
}
