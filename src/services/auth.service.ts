import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import { ILoggerService } from '../types/ILoggerService';
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

  constructor(
    @inject(INTERFACE_TYPE.UserService) userService: IUserService,
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService
  ) {
    this.userService = userService;
    this.loggerService = loggerService;
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

    return {
      user: {
        id: user._id,
        email: user.email,
      },
      sessionId: 'keke',
    };
  }
}
