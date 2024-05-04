import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import { ILoggerService } from '../types/ILoggerService';
import { ISessionService } from '../types/ISessionService';
import { IUserService } from '../types/IUserService';

/**
 * @name AuthService
 * @description Service for authentication operations
 * @method login - Login
 * @method logout - Logout
 */

@injectable()
export class AuthService implements IAuthService {
  private userService: IUserService;

  private loggerService: ILoggerService;
  private sessionService: ISessionService;

  constructor(
    @inject(INTERFACE_TYPE.UserService) userService: IUserService,
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.SessionService) sessionService: ISessionService
  ) {
    this.userService = userService;
    this.loggerService = loggerService;
    this.sessionService = sessionService;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const user = await this.userService.getUser({ email });

    if (!user) {
      throw new AppError('User not found', STATUS_CODES.NOT_FOUND, { email });
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    if (!user.emailVerified) {
      throw new AppError('Email not verified', STATUS_CODES.UNAUTHORIZED, {
        email,
      });
    }

    const session = await this.sessionService.createSession(user._id);

    return {
      user: {
        id: user._id,
        email: user.email,
      },
      sessionId: session.sessionId,
    };
  }

  async logout(sessionId: string) {
    const session = await this.sessionService.getSessionById(sessionId);

    if (!session) {
      throw new AppError('Logout failed, session not found', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    await this.sessionService.deleteSession(sessionId);

    this.loggerService.info(`Deleted session with id ${session._id}`, AuthService.name);
  }
}
