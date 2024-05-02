import { IUser } from '../models/user';

export interface IUserRepository {
  create(email: string, password: string): Promise<IUser>;
  update: (id: string, data: Partial<IUser>) => Promise<IUser | null>;
  delete(userId: string): Promise<IUser | null>;
  findOne(data: Partial<IUser>): Promise<IUser | null>;
}
