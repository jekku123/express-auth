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
/**
 * SessionService
 * This service handles the creation, retrieval, deletion, and management of user sessions.
 * It interacts with the session repository to perform CRUD operations on session data.
 *
 * Responsibilities:
 * - Creating sessions for users and generating session tokens.
 * - Retrieving sessions by session ID.
 * - Deleting sessions by session ID.
 * - Finding expired sessions and returning a list of them.
 */
export class SessionService implements ISessionService {
  constructor(
    @inject(INTERFACE_TYPE.SessionRepository) private sessionRepository: ISessionRepository
  ) {}

  /**
   * Creates a session for a user.
   * @param userId - The ID of the user.
   * @returns The newly created session.
   * @throws InternalServerError if session creation fails.
   */
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
  /**
   * Retrieves a session by its ID.
   * @param sessionId - The ID of the session.
   * @returns The session, or null if not found.
   */
  async getSessionById(sessionId: string): Promise<ISession | null> {
    const session = await this.sessionRepository.find(sessionId);
    return session;
  }

  /**
   * Deletes a session by its ID.
   * @param sessionId - The ID of the session to delete.
   * @returns The deleted session.
   * @throws InternalServerError if the session could not be deleted.
   */
  async deleteSession(sessionId: string): Promise<ISession> {
    const session = await this.sessionRepository.delete(sessionId);

    if (!session) {
      throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }

    return session;
  }

  /**
   * Finds all sessions that have expired as of the given date and time.
   * @param now - The current date and time to compare against session expiration times.
   * @returns An array of expired sessions.
   */
  async findExpiredSessions(now: Date): Promise<ISession[]> {
    const expiredSessions = await this.sessionRepository.findMany({ expiresAt: { $lt: now } });
    return expiredSessions;
  }

  /**
   * Generates a new session ID and expiration time.
   * @returns An object containing the generated session ID (token) and its expiration time.
   */
  private generateSessionId(): { token: string; expiresAt: string } {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_ID_EXPIRES).toISOString();

    return {
      token: sessionId,
      expiresAt: expiresAt,
    };
  }
}
