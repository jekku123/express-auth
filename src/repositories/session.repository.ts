import { injectable } from 'inversify';
import Session, { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';

@injectable()
export default class SessionRepository implements ISessionRepository {
  async create(userId: string): Promise<ISession> {
    const session = new Session({ userId });
    await session.save();
    return session;
  }

  async delete(sessionId: string): Promise<ISession | null> {
    const session = await Session.findOneAndDelete({ sessionId: sessionId });
    return session;
  }

  async find(sessionId: string): Promise<ISession | null> {
    const session = await Session.findOne({ sessionId: sessionId });
    return session;
  }
}
