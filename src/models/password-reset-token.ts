import mongoose, { Document, Model, Schema } from 'mongoose';
import { generateRandomString } from '../utils';

export interface IPasswordResetToken extends Document {
  token: string;
  identifier: string;
  expiresAt: Date;
}

interface IPasswordResetTokenMethods {}
interface IPasswordResetTokenStatics {}

type PasswordResetTokenModel = Model<IPasswordResetToken, {}, IPasswordResetTokenMethods> &
  IPasswordResetTokenStatics;

const passwordResetTokenSchema = new Schema<
  IPasswordResetToken,
  PasswordResetTokenModel,
  IPasswordResetTokenMethods
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

const PasswordResetToken = mongoose.model<IPasswordResetToken, PasswordResetTokenModel>(
  'PasswordResetToken',
  passwordResetTokenSchema
);

export default PasswordResetToken;
