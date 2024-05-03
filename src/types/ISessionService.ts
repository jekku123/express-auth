import { ISession } from '../models/session';

export interface ISessionService {
  createSession(userId: ISession['userId']): Promise<ISession>;
  deleteSession(sessionId: string): Promise<ISession>;
  getSessionById(sessionId: string): Promise<ISession | null>;
}
