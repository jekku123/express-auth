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
    if (!token) {
      return null;
    }
    return this.emailVerificationMapper(token);
  }

  async findMany(data: FilterQuery<IEmailVerification>): Promise<IEmailVerification[]> {
    const tokens = await EmailVerification.find(data);
    return tokens.map(this.emailVerificationMapper);
  }

  async delete(token: string): Promise<IEmailVerification> {
    const deletedToken = await EmailVerification.findOneAndDelete({ token });
    if (!deletedToken) {
      throw new InternalServerError('Email verification token not deleted');
    }
    return deletedToken;
  }

  private emailVerificationMapper(emailVerification: any): IEmailVerification {
    return {
      id: emailVerification.id,
      token: emailVerification.token,
      identifier: emailVerification.identifier,
      expiresAt: emailVerification.expiresAt,
    };
  }
}
