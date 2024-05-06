import mongoose, { Model, Schema } from 'mongoose';

export interface ISession {
  id: string;
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

interface ISessionMethods {}
interface ISessionStatics {}

type SessionModel = Model<ISession, {}, ISessionMethods> & ISessionStatics;

const sessionSchema = new Schema<ISession, SessionModel, ISessionMethods>({
  sessionId: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'userId is required'],
  },
});

const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
