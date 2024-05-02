import { IUser } from '../models/user';

export interface IUserService {
  createUser(email: string, password: string): Promise<IUser>;

  getUserProfile(userId: string): Promise<IUser | null>;
  updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserById(id: string): Promise<IUser | null>;
  setEmailVerified(userId: string): Promise<IUser | null>;
}
