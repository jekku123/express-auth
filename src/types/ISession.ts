import { Schema } from 'mongoose';

export interface ISession {
  id: string;
  sessionId: string;
  userId: Schema.Types.ObjectId;
  expiresAt: Date;
}
