import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import { InternalServerError } from '../errors/server-error';
import Session, { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';

@injectable()
export default class SessionRepository implements ISessionRepository {
  async create(data: Partial<Omit<ISession, 'userId'>> & { userId: string }): Promise<ISession> {
    const session = new Session(data);
    return await session.save();
  }

  async delete(sessionId: string): Promise<ISession | null> {
    const session = await Session.findOneAndDelete({ sessionId: sessionId });
    if (!session) {
      throw new InternalServerError('Session not deleted');
    }
    return session;
  }

  async find(data: FilterQuery<ISession>): Promise<ISession | null> {
    const session = await Session.findOne(data);
    if (!session) {
      return null;
    }
    return this.sessionMapper(session);
  }

  async findMany(data: FilterQuery<ISession>): Promise<ISession[]> {
    const sessions = await Session.find(data);
    return sessions.map(this.sessionMapper);
  }

  async findById(id: string): Promise<ISession | null> {
    const session = await Session.findById(id);
    if (!session) {
      return null;
    }
    return this.sessionMapper(session);
  }

  private sessionMapper(session: any): ISession {
    return {
      id: session.id,
      sessionId: session.sessionId,
      userId: session.userId,
      expiresAt: session.expiresAt,
    };
  }
}
