import { injectable } from 'inversify';
import VerificationToken, { IVerificationToken } from '../models/verificationToken';

@injectable()
export default class TokenRepository {
  async create(identifier: string): Promise<IVerificationToken> {
    const token = new VerificationToken({ identifier });
    const savedToken = await token.save();
    return savedToken;
  }

  async find(data: Partial<IVerificationToken>): Promise<IVerificationToken | null> {
    const token = await VerificationToken.findOne(data);
    return token;
  }

  async delete(token: string): Promise<IVerificationToken | null> {
    const deletedToken = await VerificationToken.findOneAndDelete({ token });
    return deletedToken;
  }
}
