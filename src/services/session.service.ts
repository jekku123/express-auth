import crypto from 'crypto';
import { inject, injectable } from 'inversify';

import { SESSION_ID_EXPIRES } from '../config/constants';
import { INTERFACE_TYPE } from '../container/dependencies';
import { ERROR_MESSAGES } from '../errors/error-messages';
import { InternalServerError } from '../errors/server-error';
import { ISession } from '../models/session';
import { IUser } from '../models/user';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';

@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(INTERFACE_TYPE.SessionRepository) private sessionRepository: ISessionRepository
  ) {}

  async createSession(userId: IUser['id']): Promise<ISession> {
    const { token, expiresAt } = this.generateSessionId();

    const session = await this.sessionRepository.create({
      sessionId: token,
      expiresAt: new Date(expiresAt),
      userId: userId,
    });

    if (!session) {
      throw new InternalServerError(ERROR_MESSAGES.SESSION_NOT_CREATED);
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
      throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }

    return session;
  }

  async findExpiredSessions(now: Date): Promise<ISession[]> {
    const expiredSessions = await this.sessionRepository.findMany({ expiresAt: { $lt: now } });
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
