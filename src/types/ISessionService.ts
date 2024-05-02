import { ISession } from '../models/session';

export interface ISessionService {
  createSession(userId: string): Promise<ISession>;
  deleteSession(sessionId: string): Promise<ISession>;
  getSessionById(sessionId: string): Promise<ISession | null>;
}
