import crypto from 'crypto';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';

export const SESSION_TOKEN_DURATION = 10 * 60 * 1000;

@injectable()
export class SessionService implements ISessionService {
  private sessionRepository: ISessionRepository;

  constructor(@inject(INTERFACE_TYPE.SessionRepository) sessionRepository: ISessionRepository) {
    this.sessionRepository = sessionRepository;
  }

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

  generateSessionId(): { token: string; expiresAt: string } {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TOKEN_DURATION).toISOString();

    return {
      token: sessionId,
      expiresAt: expiresAt,
    };
  }

  async deleteSession(sessionId: string): Promise<ISession> {
    const session = await this.sessionRepository.delete(sessionId);

    if (!session) {
      throw new Error('Session not deleted');
    }

    return session;
  }
}
