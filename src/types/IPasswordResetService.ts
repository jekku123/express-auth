import { IUser } from '../models/user';

export interface IPasswordResetService {
  create(identifier: string): Promise<string>;
  reset(email: string): Promise<IUser>;
  resetConfirm(token: string, password: string): Promise<IUser>;
  verify(token: string): Promise<boolean>;
  delete(token: string): Promise<boolean>;
}
