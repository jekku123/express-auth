import mongoose, { Model, Schema } from 'mongoose';

interface AccountMethods {}

export interface AccountType {
  _id: string;
  refreshToken?: string;
  expiresAt?: Date;
  sessionState?: string;
  userId: Schema.Types.ObjectId;
}

type AccountModel = Model<AccountType, {}, AccountMethods>;

const accountSchema = new Schema<AccountType, AccountModel, AccountMethods>({
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

const Account = mongoose.model('Account', accountSchema);

export default Account;
