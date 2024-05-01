import crypto from 'crypto';
import mongoose, { Model, Schema } from 'mongoose';

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
    default: () => crypto.randomBytes(32).toString('hex'),
  },
  expiresAt: {
    type: Date,
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
