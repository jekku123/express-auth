import crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { SESSION_ID_EXPIRES } from '../config/cookieSettings';
import { INTERFACE_TYPE } from '../container/dependencies';
import { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';

@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(INTERFACE_TYPE.SessionRepository) private sessionRepository: ISessionRepository
  ) {}

  async createSession(userId: ISession['userId']): Promise<ISession> {
    const { token, expiresAt } = this.generateSessionId();

    const session = await this.sessionRepository.create({
      sessionId: token,
      expiresAt: new Date(expiresAt),
      userId: userId,
    });

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

  async findExpiredSessions(now: Date): Promise<ISession[]> {
    const expiredSessions = await this.sessionRepository.findMany({});
    return expiredSessions;
  }

  private generateSessionId(): { token: string; expiresAt: string } {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_ID_EXPIRES).toISOString();

    return {
      token: sessionId,
      expiresAt: expiresAt,
    };
  }
}
