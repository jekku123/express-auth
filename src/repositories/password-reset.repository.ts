import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { InternalServerError } from '../errors/server-error';
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
    if (!token) {
      return null;
    }
    return this.passwordResetMapper(token);
  }

  async findMany(data: FilterQuery<IPasswordReset>): Promise<IPasswordReset[]> {
    const tokens = await PasswordReset.find(data);
    return tokens.map(this.passwordResetMapper);
  }

  async delete(token: string): Promise<IPasswordReset | null> {
    const deletedToken = await PasswordReset.findOneAndDelete({ token });
    if (!deletedToken) {
      throw new InternalServerError('Password reset token not deleted');
    }
    return deletedToken;
  }

  private passwordResetMapper(passwordReset: any): IPasswordReset {
    return {
      id: passwordReset.id,
      token: passwordReset.token,
      identifier: passwordReset.identifier,
      expiresAt: passwordReset.expiresAt,
    };
  }
}
