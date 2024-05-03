import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { ISession } from '../models/session';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';
import { ITokenService } from '../types/ITokenService';

@injectable()
export class SessionService implements ISessionService {
  private sessionRepository: ISessionRepository;
  private tokenService: ITokenService;

  constructor(
    @inject(INTERFACE_TYPE.SessionRepository) sessionRepository: ISessionRepository,
    @inject(INTERFACE_TYPE.TokenService) tokenService: ITokenService
  ) {
    this.sessionRepository = sessionRepository;
    this.tokenService = tokenService;
  }

  /**
   * @description Create a new session in the database
   * @usage `await sessionService.createSession({ userId, sessionId?, expiresAt})`
   * you can override the default sessionId and expiresAt by passing them in the data object
   */
  async createSession(userId: ISession['userId']): Promise<ISession> {
    const { token, expiresAt } = this.tokenService.generateSessionId();

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
}
