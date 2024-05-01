import { UserType } from '../models/user';

export interface IUserService {
  createUser(email: string, password: string): Promise<UserType>;

  getUserProfile(userId: string): Promise<UserType>;
  updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<UserType | null>;
}
