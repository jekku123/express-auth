import { injectable } from 'inversify';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import VerificationToken, { IVerificationToken } from '../models/verificationToken';
import { ITokenService } from '../types/ITokenService';

@injectable()
export default class TokenService implements ITokenService {
  async generateToken(email: string): Promise<IVerificationToken> {
    const existingToken = await VerificationToken.findByEmail(email);

    if (existingToken) {
      await VerificationToken.findByIdAndDelete(existingToken._id);
    }

    const verificationToken = new VerificationToken({ identifier: email });
    const savedToken = await verificationToken.save();

    if (!savedToken) {
      throw new AppError('Verification token not created', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return savedToken;
  }
  verifyToken(token: string): boolean {
    throw new Error('Method not implemented.');
  }
  getTokenByToken(token: string) {
    throw new Error('Method not implemented.');
  }
  getTokenByEmail(email: string) {
    throw new Error('Method not implemented.');
  }
  deleteToken(token: string) {
    throw new Error('Method not implemented.');
  }
}
