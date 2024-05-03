import { IAccount } from '../models/account';

export interface IAccountService {
  createAccount(userId: string): Promise<any>;
  deleteAccount(id: string): Promise<any>;
  updateAccount(id: string, data: Partial<IAccount>): Promise<any>;
  updateOrCreateAccount(userId: string, data: Partial<IAccount>): Promise<any>;
}
