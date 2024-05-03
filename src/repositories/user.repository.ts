import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import User, { IUser } from '../models/user';
import { IUserRepository } from '../types/IUserRepository';

@injectable()
export default class UserRepository implements IUserRepository {
  async create(email: string, password: string): Promise<IUser> {
    const user = new User({ email, password });
    const savedUser = await user.save();
    return savedUser;
  }

  async findOne(data: FilterQuery<IUser>): Promise<IUser | null> {
    const user = await User.findOne(data);
    return user;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, data);
    return updatedUser;
  }

  async delete(id: string): Promise<IUser | null> {
    const deletedUser = await User.findOneAndDelete({ _id: id });
    return deletedUser;
  }
}
