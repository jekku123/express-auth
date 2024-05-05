import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISession extends Document {
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

const Session = mongoose.model<ISession, SessionModel>('Session', sessionSchema);

export default Session;
