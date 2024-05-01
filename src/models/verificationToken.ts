import { randomUUID } from 'crypto';
import mongoose, { Model, Schema } from 'mongoose';

interface VerificationTokenMethods {
  verifyToken: (token: string) => {
    success: boolean;
    message: string;
  };
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

verificationTokenSchema.method('verifyToken', function (token: string) {
  if (this.expiresAt < new Date(Date.now())) {
    return {
      success: false,
      message: 'Verification token expired',
    };
  }
  if (this.verificationToken !== token) {
    return {
      success: false,
      message: 'Invalid verification token',
    };
  }
  return {
    success: true,
    message: 'Verification token verified',
  };
});

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

export default VerificationToken;
