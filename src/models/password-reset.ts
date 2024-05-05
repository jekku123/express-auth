import crypto from 'crypto';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPasswordReset extends Document {
  token: string;
  identifier: string;
  expiresAt: Date;
}

interface IPasswordResetMethods {}
interface IPasswordResetStatics {}

type PasswordResetModel = Model<IPasswordReset, {}, IPasswordResetMethods> & IPasswordResetStatics;

const passwordResetSchema = new Schema<IPasswordReset, PasswordResetModel, IPasswordResetMethods>({
  token: {
    type: String,
    default: () => crypto.randomBytes(32).toString('hex'),
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

const PasswordReset = mongoose.model<IPasswordReset, PasswordResetModel>(
  'PasswordReset',
  passwordResetSchema
);

export default PasswordReset;
