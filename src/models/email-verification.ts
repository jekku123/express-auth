import crypto from 'crypto';
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEmailVerification extends Document {
  token: string;
  identifier: string;
  expiresAt: Date;
}

interface IEmailVerificationMethods {}

interface IEmailVerificationStatics {}

type EmailVerificationModel = Model<IEmailVerification, {}, IEmailVerificationMethods> &
  IEmailVerificationStatics;

const emailVerificationSchema = new Schema<
  IEmailVerification,
  EmailVerificationModel,
  IEmailVerificationMethods
>({
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

const EmailVerification = mongoose.model<IEmailVerification, EmailVerificationModel>(
  'EmailVerification',
  emailVerificationSchema
);

export default EmailVerification;
