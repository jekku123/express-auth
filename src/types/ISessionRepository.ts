import { ISession } from '../models/session';

export interface ISessionRepository {
  create(userId: string): Promise<ISession>;
  delete(sessionId: string): Promise<ISession | null>;
  find(sessionId: string): Promise<ISession | null>;
}
