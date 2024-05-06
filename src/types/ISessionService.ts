import { ISession } from '../models/session';
import { IUser } from '../models/user';

export interface ISessionService {
  createSession(userId: IUser['id']): Promise<ISession>;
  deleteSession(sessionId: string): Promise<ISession>;
  getSessionById(sessionId: string): Promise<ISession | null>;
  findExpiredSessions(now: Date): Promise<ISession[]>;
}
