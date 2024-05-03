import { IAccount } from '../models/account';

export interface IAccountRepository {
  delete(id: string): Promise<any>;
  find(id: string): Promise<any>;
  create(userId: string): Promise<any>;
  update(userId: string, data: Partial<IAccount>): Promise<any>;
}
