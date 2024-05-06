import { IUser } from '../models/user';

export interface IUserRepository {
  create(email: string, password: string): Promise<IUser>;
  find(data: Partial<IUser>): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findMany(data: Partial<IUser>): Promise<IUser[]>;
  update: (id: string, data: Partial<IUser>) => Promise<IUser>;
  delete(userId: string): Promise<IUser>;
}
