import mongoose, { Document, HydratedDocument, Model, Schema } from 'mongoose';
import { generateRandomString } from '../utils';

export interface IVerificationToken extends Document {
  token: string;
  identifier: string;
  expiresAt: Date;
}

interface IVerificationTokenMethods {
  verifyToken: (token: string) => {
    success: boolean;
    message: string;
  };
}

interface IVerificationTokenStatics {
  findByEmail: (
    email: string
  ) => Promise<HydratedDocument<IVerificationToken, IVerificationTokenMethods>> | null;
  findByToken: (
    token: string
  ) => Promise<HydratedDocument<IVerificationToken, IVerificationTokenMethods>> | null;
}

type VerificationTokenModel = Model<IVerificationToken, {}, IVerificationTokenMethods> &
  IVerificationTokenStatics;

const verificationTokenSchema = new Schema<
  IVerificationToken,
  VerificationTokenModel,
  IVerificationTokenMethods
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

verificationTokenSchema.static('findByEmail', function (email: string) {
  return this.findOne({ email });
});

verificationTokenSchema.static('findByToken', function (token: string) {
  return this.findOne({ token });
});

const VerificationToken = mongoose.model<IVerificationToken, VerificationTokenModel>(
  'VerificationToken',
  verificationTokenSchema
);

export default VerificationToken;
