import mongoose, { Model, Schema } from 'mongoose';

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
  },
  expiresAt: {
    type: Date,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required'],
  },
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;
