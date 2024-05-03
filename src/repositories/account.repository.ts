import { injectable } from 'inversify';
import Account, { IAccount } from '../models/account';
import { IAccountRepository } from '../types/IAccountRepository';

@injectable()
export default class AccountRepository implements IAccountRepository {
  async create(userId: string): Promise<any> {
    const account = new Account({ userId });
    return await account.save();
  }

  async update(userId: string, data: Partial<IAccount>): Promise<any> {
    const updatedAccount = await Account.findOneAndUpdate({ userId }, data, {
      new: true,
      upsert: true,
    });
    return updatedAccount;
  }

  async delete(id: string): Promise<any> {
    const deletedAccount = await Account.findByIdAndDelete(id);
    return deletedAccount;
  }

  async find(id: string): Promise<any> {
    const account = await Account.findById(id);
    return account;
  }
}
