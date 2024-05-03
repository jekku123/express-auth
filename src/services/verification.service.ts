import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IVerificationToken } from '../models/verificationToken';

import { IVerificationRepository } from '../types/IVerificationRepository';
import { IVerificationService } from '../types/IVerificationService';

@injectable()
export default class VerificationService implements IVerificationService {
  private verificationRepository: IVerificationRepository;

  constructor(
    @inject(INTERFACE_TYPE.TokenRepository) verificationRepository: IVerificationRepository
  ) {
    this.verificationRepository = verificationRepository;
  }
  async generateVerificationToken(email: string): Promise<IVerificationToken> {
    const existingToken = await this.verificationRepository.find({ identifier: email });

    if (existingToken) {
      await this.verificationRepository.delete(existingToken.token);
    }

    const verificationToken = this.verificationRepository.create(email);

    if (!verificationToken) {
      throw new AppError('Verification token not created', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return verificationToken;
  }

  async deleteToken(token: string): Promise<IVerificationToken> {
    const deletedToken = await this.verificationRepository.delete(token);

    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return deletedToken;
  }

  async findTokenByToken(token: string): Promise<IVerificationToken | null> {
    const foundToken = await this.verificationRepository.find({ token });
    return foundToken;
  }

  async findTokenByEmail(email: string): Promise<IVerificationToken | null> {
    const token = await this.verificationRepository.find({ identifier: email });
    return token;
  }
}
