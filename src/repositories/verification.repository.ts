import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import VerificationToken, { IVerificationToken } from '../models/verificationToken';
import { IVerificationRepository } from '../types/IVerificationRepository';

@injectable()
export default class VerificationRepository implements IVerificationRepository {
  async create(identifier: string): Promise<IVerificationToken> {
    const token = new VerificationToken({ identifier });
    const savedToken = await token.save();
    return savedToken;
  }

  async find(data: FilterQuery<IVerificationToken>): Promise<IVerificationToken | null> {
    const token = await VerificationToken.findOne(data);
    return token;
  }

  async delete(token: string): Promise<IVerificationToken | null> {
    const deletedToken = await VerificationToken.findOneAndDelete({ token });
    return deletedToken;
  }
}
