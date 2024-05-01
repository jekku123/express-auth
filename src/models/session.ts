import mongoose, { Model, Schema } from 'mongoose';
import { generateRandomString } from '../utils';

export const SESSION_ID_EXPIRES = 2 * 60 * 1000;
export const SESSION_EXPIRATION_THRESHOLD = 1 * 60 * 1000;

interface SessionMethods {}

export interface SessionType {
  _id: string;
  sessionId: string;
  userId: Schema.Types.ObjectId;
  expiresAt: Date;
}

type SessionModel = Model<SessionType, {}, SessionMethods>;

const sessionSchema = new Schema<SessionType, SessionModel, SessionMethods>({
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

const Session = mongoose.model('Session', sessionSchema);

export default Session;
