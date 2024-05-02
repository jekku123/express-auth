import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';

@injectable()
export class SessionService implements ISessionService {
  private sessionRepository: ISessionRepository;

  constructor(@inject(INTERFACE_TYPE.SessionRepository) sessionRepository: ISessionRepository) {
    this.sessionRepository = sessionRepository;
  }

  async createSession(userId: string): Promise<ISession> {
    const session = await this.sessionRepository.create(userId);

    if (!session) {
      throw new Error('Session not created');
    }

    return session;
  }

  async getSessionById(sessionId: string): Promise<ISession | null> {
    const session = await this.sessionRepository.find(sessionId);
    return session;
  }

  async deleteSession(sessionId: string): Promise<ISession> {
    const session = await this.sessionRepository.delete(sessionId);

    if (!session) {
      throw new Error('Session not deleted');
    }

    return session;
  }
}
