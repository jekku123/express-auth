import { FilterQuery } from 'mongoose';
import { IPasswordReset } from '../models/password-reset';

export interface IPasswordResetRepository {
  create(identifier: string): Promise<IPasswordReset>;
  find(data: FilterQuery<IPasswordReset>): Promise<IPasswordReset | null>;
  findMany(data: FilterQuery<IPasswordReset>): Promise<IPasswordReset[]>;
  delete(token: string): Promise<IPasswordReset | null>;
}
