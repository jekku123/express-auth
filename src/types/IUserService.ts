import { IUser } from '../models/user';

export interface IUserService {
  createUser(email: string, password: string): Promise<IUser>;
  updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser | null>;
  getUser(data: Partial<IUser>): Promise<IUser | null>;
  setEmailVerified(userId: string): Promise<IUser | null>;
  verifyCredentials(email: string, password: string): Promise<IUser>;
}
