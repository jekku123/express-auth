import mongoose, { Model, Schema } from 'mongoose';
import { generateRandomString } from '../utils';

interface VerificationTokenMethods {
  verifyToken: (token: string) => {
    success: boolean;
    message: string;
  };
}

export interface VerificationTokenType {
  _id: string;
  token: string;
  identifier: string;
  expiresAt: Date;
}

type VerificationTokenModel = Model<VerificationTokenType, {}, VerificationTokenMethods>;

const verificationTokenSchema = new Schema<
  VerificationTokenType,
  VerificationTokenModel,
  VerificationTokenMethods
>({
  token: {
    type: String,
    default: () => generateRandomString(),
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000,
  },
  identifier: {
    type: String,
    required: [true, 'identifier is required'],
  },
});

verificationTokenSchema.method('verifyToken', function (token: string) {
  if (this.expiresAt < new Date(Date.now())) {
    return {
      success: false,
      message: 'Verification token expired',
    };
  }
  return {
    success: true,
    message: 'Verification token verified',
  };
});

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

export default VerificationToken;
