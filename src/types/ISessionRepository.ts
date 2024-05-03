import { ISession } from '../models/session';

export interface ISessionRepository {
  create({ userId, sessionId, expiresAt }: Partial<ISession>): Promise<ISession>;
  delete(sessionId: string): Promise<ISession | null>;
  find(sessionId: string): Promise<ISession | null>;
}
