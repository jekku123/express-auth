import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import VerificationToken, { IVerificationToken } from '../models/verification-token';
import { IVerificationRepository } from '../types/IVerificationRepository';

@injectable()
export default class VerificationRepository implements IVerificationRepository {
  async create(identifier: string): Promise<IVerificationToken> {
    const token = VerificationToken.create({ identifier });
    return token;
  }

  async find(data: FilterQuery<IVerificationToken>): Promise<IVerificationToken | null> {
    const token = await VerificationToken.findOne(data);
    return token;
  }

  async delete(token: string): Promise<IVerificationToken> {
    const deletedToken = await VerificationToken.findOneAndDelete({ token });
    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return deletedToken;
  }

  async save(token: IVerificationToken): Promise<IVerificationToken> {
    const savedToken = await token.save();
    return savedToken;
  }
}
