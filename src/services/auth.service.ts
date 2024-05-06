import { inject, injectable } from 'inversify';

import { ERROR_MESSAGES } from '../errors/error-messages';
import { IAuthService } from '../types/IAuthService';

import { ILoggerService } from '../types/ILoggerService';
import { IUserService } from '../types/IUserService';

/**
 * @name AuthService
 * @description Service for authentication operations
 * @method login - Login
 */

import { INTERFACE_TYPE } from '../container/dependencies';
import { UnauthorizedError } from '../errors/auth-error';
import { BadRequestError, NotFoundError } from '../errors/client-error';
import { InternalServerError } from '../errors/server-error';
import { ISession } from '../models/session';
import { IUser } from '../models/user';
import { ISessionService } from '../types/ISessionService';
import { IUserResponse } from '../types/IUserResponse';

/**
 * @name AuthService
 * @description Service for authentication operations
 * @method login - Login
 */
@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(INTERFACE_TYPE.UserService) private userService: IUserService,
    @inject(INTERFACE_TYPE.LoggerService) private loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.SessionService) private sessionService: ISessionService
  ) {}

  async login(email: string, password: string) {
    this.validateCredentials(email, password);

    const user = await this.getUserByEmail(email);

    await this.verifyPassword(password, user.password);
    this.verifyEmailVerification(user.emailVerified, email);

    const sessionId = await this.startSession(user.id);

    this.loggerService.info(`User with email ${email} logged in`, { service: AuthService.name });

    return this.getUserResponse(user, sessionId);
  }

  async logout(sessionId: string) {
    const logoutResult = await this.sessionService.deleteSession(sessionId);
    if (!logoutResult) {
      throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  private validateCredentials(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestError(ERROR_MESSAGES.BAD_REQUEST);
    }
  }

  private async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, { email });
    }
    return user;
  }

  private async verifyPassword(inputPassword: string, storedPassword: string) {
    const isPasswordValid = await Bun.password.verify(inputPassword, storedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  private verifyEmailVerification(emailVerified: boolean, email: string) {
    if (!emailVerified) {
      throw new UnauthorizedError(ERROR_MESSAGES.EMAIL_NOT_VERIFIED, { email });
    }
  }

  private async startSession(userId: IUser['id']): Promise<ISession['sessionId']> {
    const session = await this.sessionService.createSession(userId);
    if (!session) {
      throw new InternalServerError(ERROR_MESSAGES.SESSION_NOT_CREATED);
    }
    return session.sessionId;
  }

  private getUserResponse(user: IUser, sessionId: ISession['sessionId']): IUserResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      sessionId,
    };
  }
}
