import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IVerificationToken } from '../models/verificationToken';
import { ITokenRepository } from '../types/ITokenRepository';
import { ITokenService } from '../types/ITokenService';

@injectable()
export default class TokenService implements ITokenService {
  private tokenRepository: ITokenRepository;

  constructor(@inject(INTERFACE_TYPE.TokenRepository) tokenRepository: ITokenRepository) {
    this.tokenRepository = tokenRepository;
  }
  async generateVerificationToken(email: string): Promise<IVerificationToken> {
    const existingToken = await this.tokenRepository.find({ identifier: email });

    if (existingToken) {
      await this.tokenRepository.delete(existingToken.token);
    }

    const verificationToken = this.tokenRepository.create(email);

    if (!verificationToken) {
      throw new AppError('Verification token not created', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return verificationToken;
  }

  async deleteToken(token: string): Promise<IVerificationToken> {
    const deletedToken = await this.tokenRepository.delete(token);

    if (!deletedToken) {
      throw new AppError('Token not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    return deletedToken;
  }

  async findTokenByToken(token: string): Promise<IVerificationToken | null> {
    const foundToken = await this.tokenRepository.find({ token });
    return foundToken;
  }

  async findTokenByEmail(email: string): Promise<IVerificationToken | null> {
    const token = await this.tokenRepository.find({ identifier: email });
    return token;
  }
}
