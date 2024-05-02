import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Account, { IAccount } from './account';

export interface IUser {
  id: string;
  name?: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  password: string;
}

interface IUserMethods {
  verifyPassword: (password: string) => Promise<boolean>;
  linkAccount: (userId: string, email: string) => Promise<IAccount>;
}

interface IUserStatics {
  findByEmail: (email: string) => Promise<HydratedDocument<IUser, IUserMethods>>;
}

type UserModel = Model<IUser, {}, IUserMethods> & IUserStatics;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
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

userSchema.static('findByEmail', function (email: string) {
  return this.findOne({ email });
});

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
