import { inject, injectable } from 'inversify';

import AppError from '../errors/AppError';
import { ERROR_MESSAGES } from '../errors/errorMessages';
import { STATUS_CODES } from '../errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import { ILoggerService } from '../types/ILoggerService';
import { IUserService } from '../types/IUserService';

/**
 * @name AuthService
 * @description Service for authentication operations
 * @method login - Login
 */

import { INTERFACE_TYPE } from '../container/dependencies';
import { IUser } from '../models/user';
import { ISessionService } from '../types/ISessionService';

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

    this.loggerService.info(`User with email ${email} logged in`, { service: AuthService.name });

    return this.getUserResponse(user);
  }

  async logout(sessionId: string) {
    const logoutResult = await this.sessionService.deleteSession(sessionId);
    if (!logoutResult) {
      throw new AppError('Session not deleted', STATUS_CODES.INTERNAL_SERVER_ERROR);
    }
  }

  private validateCredentials(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }
  }

  private async getUserByEmail(email: string): Promise<IUser> {
    const user = await this.userService.getUser({ email });
    if (!user) {
      throw new AppError('User not found', STATUS_CODES.NOT_FOUND, { email });
    }
    return user;
  }

  private async verifyPassword(inputPassword: string, storedPassword: string) {
    const isPasswordValid = await Bun.password.verify(inputPassword, storedPassword);
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }
  }

  private verifyEmailVerification(emailVerified: boolean, email: string) {
    if (!emailVerified) {
      throw new AppError('Email not verified', STATUS_CODES.UNAUTHORIZED, { email });
    }
  }

  private getUserResponse(user: IUser) {
    return {
      user: {
        id: user._id,
        email: user.email,
      },
      sessionId: 'keke',
    };
  }
}
