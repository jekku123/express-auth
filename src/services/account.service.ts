import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAccount } from '../models/account';
import { IAccountRepository } from '../types/IAccountRepository';
import { IAccountService } from '../types/IAccountService';

@injectable()
export class AccountService implements IAccountService {
  private accountRepository: IAccountRepository;

  constructor(@inject(INTERFACE_TYPE.AccountRepository) accountRepository: IAccountRepository) {
    this.accountRepository = accountRepository;
  }
  async createAccount(userId: string): Promise<any> {
    const account = await this.accountRepository.create(userId);

    if (!account) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return account;
  }

  async deleteAccount(id: string): Promise<any> {
    const account = await this.accountRepository.delete(id);

    if (!account) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return account;
  }

  async updateAccount(id: string, data: Partial<IAccount>): Promise<any> {
    const updatedAccount = await this.accountRepository.update(id, data);

    if (!updatedAccount) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    return updatedAccount;
  }

  async updateOrCreateAccount(userId: string, data: Partial<IAccount>): Promise<any> {
    const updatedAccount = await this.accountRepository.update(userId, data);

    if (!updatedAccount) {
      throw new AppError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return updatedAccount;
  }
}
