import { FilterQuery } from 'mongoose';
import { IPasswordResetToken } from '../models/password-reset-token';

export interface IPasswordResetRepository {
  create(identifier: string): Promise<IPasswordResetToken>;
  find(data: FilterQuery<IPasswordResetToken>): Promise<IPasswordResetToken | null>;
  delete(token: string): Promise<IPasswordResetToken | null>;
}
