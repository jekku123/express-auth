import mongoose, { Model, Schema } from 'mongoose';

export interface IAccount {
  _id: string;
  refreshToken?: string;
  expiresAt?: Date;
  sessionState?: string;
  userId: Schema.Types.ObjectId;
}

interface IAccountMethods {}
interface IAccountStatics {}

type AccountModel = Model<IAccount, {}, IAccountMethods> & IAccountStatics;

const accountSchema = new Schema<IAccount, AccountModel, IAccountMethods>({
  refreshToken: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  sessionState: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required'],
  },
});

const Account = mongoose.model<IAccount, AccountModel>('Account', accountSchema);

export default Account;
