import { IUser } from '../models/user';

export interface IUserService {
  createUser(email: string, password: string): Promise<IUser>;

  getUserProfile(userId: string): Promise<IUser>;
  updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser | null>;
}
