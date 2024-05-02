import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';

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
}

interface IUserStatics {
  findByEmail: (email: string) => Promise<HydratedDocument<IUser, IUserMethods> | null>;
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

userSchema.static('findByEmail', function (email: string) {
  return this.findOne({ email });
});

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
