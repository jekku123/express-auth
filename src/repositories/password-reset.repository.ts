import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import PasswordResetToken, { IPasswordResetToken } from '../models/password-reset-token';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';

@injectable()
export default class PasswordResetRepository implements IPasswordResetRepository {
  async create(identifier: string): Promise<IPasswordResetToken> {
    const token = new PasswordResetToken({ identifier });
    return token.save();
  }

  async find(data: FilterQuery<IPasswordResetToken>): Promise<IPasswordResetToken | null> {
    const token = await PasswordResetToken.findOne(data);
    return token;
  }

  async delete(token: string): Promise<IPasswordResetToken | null> {
    const deletedToken = await PasswordResetToken.findOneAndDelete({ token });
    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return deletedToken;
  }

  async save(token: IPasswordResetToken): Promise<IPasswordResetToken> {
    const savedToken = await token.save();
    if (!savedToken) {
      throw new AppError('Token not saved', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return savedToken;
  }
}
