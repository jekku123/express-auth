import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { InternalServerError } from '../errors/server-error';
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
      throw new InternalServerError('User not updated');
    }
    return updatedUser;
  }

  async delete(id: string): Promise<IUser> {
    const deletedUser = await User.findOneAndDelete({ _id: id });
    if (!deletedUser) {
      throw new InternalServerError('User not deleted');
    }
    return deletedUser;
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await User.findById(id);
    return user;
  }

  // async save(user: IUser): Promise<IUser> {
  //   const savedUser = await user.save();
  //   return savedUser;
  // }
}
