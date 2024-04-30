import mongoose, { Model, Schema } from 'mongoose';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Account, { AccountType } from './account';
import VerificationToken from './verificationToken';

interface UserMethods {
  verifyPassword: (password: string) => Promise<boolean>;
  setPassword: (password: string) => Promise<UserType>;
  linkAccount: (userId: string, email: string) => Promise<AccountType>;
  createVerificationToken: (userId: string) => Promise<string>;
}

export interface UserType {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  password: string;
}

type UserModel = Model<UserType, {}, UserMethods>;

const userSchema = new Schema<UserType, UserModel, UserMethods>({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  image: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await Bun.password.hash(this.password);
  }
  next();
});

userSchema.method('verifyPassword', async function (password: string) {
  return await Bun.password.verify(password, this.password);
});

userSchema.method('setPassword', async function (password: string) {
  this.password = await Bun.password.hash(password);
  return this;
});

userSchema.method('linkAccount', async function (userId: string, email: string) {
  const account = await Account.findOne({ email });
  if (account) {
    throw new AppError('Email already linked', STATUS_CODES.BAD_REQUEST, { email });
  }
  const newAccount = new Account({ userId });
  const savedAccount = await newAccount.save();

  if (!savedAccount) {
    throw new AppError('Account not linked', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  return savedAccount;
});

userSchema.method('createVerificationToken', async function (userId: string) {
  const isToken = await VerificationToken.findOne({
    userId,
  });

  if (isToken) {
    throw new AppError('Verification token already exists', STATUS_CODES.BAD_REQUEST);
  }
  const verificationToken = new VerificationToken({ userId });
  const savedToken = await verificationToken.save();

  if (!savedToken) {
    throw new AppError('Verification token not created', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }

  return savedToken.verificationToken;
});

const User = mongoose.model('User', userSchema);

export default User;
