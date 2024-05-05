import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import AppError from '../errors/AppError';
import { STATUS_CODES } from '../errors/statusCodes';
import User, { IUser } from '../models/user';
import { IUserRepository } from '../types/IUserRepository';

@injectable()
export default class UserRepository implements IUserRepository {
  async create(email: string, password: string): Promise<IUser> {
    const user = User.create({ email, password });
    return user;
  }

  async find(data: FilterQuery<IUser>): Promise<IUser | null> {
    const user = await User.findOne(data);
    return user;
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    const updatedUser = await User.findOneAndUpdate({ _id: id }, data);
    if (!updatedUser) {
      throw new AppError('User not updated', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return updatedUser;
  }

  async delete(id: string): Promise<IUser> {
    const deletedUser = await User.findOneAndDelete({ _id: id });
    if (!deletedUser) {
      throw new AppError('User not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return deletedUser;
  }

  async save(user: IUser): Promise<IUser> {
    const savedUser = await user.save();
    return savedUser;
  }
}
