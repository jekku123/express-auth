import { randomUUID } from 'crypto';
import mongoose, { Model, Schema } from 'mongoose';
import AppError from '../config/errors/AppError';

interface VerificationTokenMethods {
  verifyToken: (token: string) => Promise<boolean>;
}

export interface VerificationTokenType {
  _id: string;
  verificationToken: string;
  userId: Schema.Types.ObjectId;
  expiresAt: Date;
}

type VerificationTokenModel = Model<VerificationTokenType, {}, VerificationTokenMethods>;

const verificationTokenSchema = new Schema<
  VerificationTokenType,
  VerificationTokenModel,
  VerificationTokenMethods
>({
  verificationToken: {
    type: String,
    default: () => randomUUID(),
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required'],
  },
});

verificationTokenSchema.method('verifyToken', async function (token: string) {
  if (this.expiresAt < new Date(Date.now())) {
    throw new AppError('Verification token expired', 401);
  }
  if (this.verificationToken !== token) {
    throw new AppError('Invalid verification token', 401);
  }
  return true;
});

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

export default VerificationToken;
