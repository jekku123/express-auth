import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Session, { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';

@injectable()
export default class SessionRepository implements ISessionRepository {
  async create(data: Partial<ISession>): Promise<ISession> {
    const session = new Session(data);
    return await session.save();
  }

  async delete(sessionId: string): Promise<ISession | null> {
    const session = await Session.findOneAndDelete({ sessionId: sessionId });
    if (!session) {
      throw new AppError('Session not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
    return session;
  }

  async find(sessionId: string): Promise<ISession | null> {
    const session = await Session.findOne({ sessionId: sessionId });
    return session;
  }

  async findMany(data: FilterQuery<ISession>): Promise<ISession[]> {
    const sessions = await Session.find(data);
    return sessions;
  }

  async save(session: ISession): Promise<ISession> {
    const savedSession = await session.save();
    return savedSession;
  }
}
