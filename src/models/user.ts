import mongoose, { Model, Schema } from 'mongoose';

export interface IUser {
  id: string;
  name?: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  password: string;
}

interface IUserMethods {}

interface IUserStatics {}

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

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
