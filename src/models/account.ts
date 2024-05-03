import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAccount extends Document {
  userId: Schema.Types.ObjectId;
  refreshToken?: string;
  accessToken?: string;
  expiresAt?: Date;
  tokenType?: string;
}

interface IAccountMethods {}
interface IAccountStatics {}

type AccountModel = Model<IAccount, {}, IAccountMethods> & IAccountStatics;

const accountSchema = new Schema<IAccount, AccountModel, IAccountMethods>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  refreshToken: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  tokenType: {
    type: String,
  },
});

const Account = mongoose.model<IAccount, AccountModel>('Account', accountSchema);

export default Account;
