import mongoose, { Model, Schema } from 'mongoose';
import { generateRandomString } from '../utils';

export const SESSION_ID_EXPIRES = 2 * 60 * 1000;
export const SESSION_EXPIRATION_THRESHOLD = 1 * 60 * 1000;

export interface ISession {
  _id: string;
  sessionId: string;
  userId: Schema.Types.ObjectId;
  expiresAt: Date;
}

interface ISessionMethods {}
interface ISessionStatics {}

type SessionModel = Model<ISession, {}, ISessionMethods> & ISessionStatics;

const sessionSchema = new Schema<ISession, SessionModel, ISessionMethods>({
  sessionId: {
    type: String,
    default: () => generateRandomString(),
  },
  expiresAt: {
    type: Date,
    expires: SESSION_ID_EXPIRES / 1000,
    default: () => Date.now() + SESSION_ID_EXPIRES,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required'],
  },
});

const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
