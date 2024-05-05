import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import AppError from '../errors/AppError';
import { STATUS_CODES } from '../errors/statusCodes';
import PasswordReset, { IPasswordReset } from '../models/password-reset';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';

@injectable()
export default class PasswordResetRepository implements IPasswordResetRepository {
  async create(identifier: string): Promise<IPasswordReset> {
    const token = new PasswordReset({ identifier });
    return token.save();
  }

  async find(data: FilterQuery<IPasswordReset>): Promise<IPasswordReset | null> {
    const token = await PasswordReset.findOne(data);
    return token;
  }

  async delete(token: string): Promise<IPasswordReset | null> {
    const deletedToken = await PasswordReset.findOneAndDelete({ token });
    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return deletedToken;
  }
}
