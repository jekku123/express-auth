import { IUser } from '../models/user';

export interface IUserService {
  register(email: string, password: string): Promise<IUser>;
  updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser | null>;
  findUser(data: Partial<IUser>): Promise<IUser | null>;
  findUserById(userId: string): Promise<IUser>;
  findUserByEmail(email: string): Promise<IUser>;
  verifyEmail(email: string): Promise<IUser>;
  resetPassword(userId: string, password: string): Promise<IUser>;
  forgotPassword(email: string): Promise<void>;
}
