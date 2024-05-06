import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { InternalServerError } from '../errors/server-error';
import EmailVerification, { IEmailVerification } from '../models/email-verification';
import { IEmailVerificationRepository } from '../types/IEmailVerificationRepository';

@injectable()
export default class EmailVerificationRepository implements IEmailVerificationRepository {
  async create(identifier: string): Promise<IEmailVerification> {
    const token = EmailVerification.create({ identifier });
    return token;
  }

  async find(data: FilterQuery<IEmailVerification>): Promise<IEmailVerification | null> {
    const token = await EmailVerification.findOne(data);
    return token;
  }

  async delete(token: string): Promise<IEmailVerification> {
    const deletedToken = await EmailVerification.findOneAndDelete({ token });
    if (!deletedToken) {
      throw new InternalServerError('Email verification token not deleted');
    }
    return deletedToken;
  }
}
