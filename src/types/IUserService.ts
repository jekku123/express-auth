import { UserType } from '../models/user';

export interface IUserService {
  register(email: string, password: string): Promise<UserType>;

  getUserProfile(id: string): Promise<UserType>;
  updatePassword(email: string, oldPassword: string, newPassword: string): Promise<UserType | null>;
}
