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
 */

import { IUser } from '../models/user';

/**
 * @name AuthService
 * @description Service for authentication operations
 * @method login - Login
 */
@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(INTERFACE_TYPE.UserService) private userService: IUserService,
    @inject(INTERFACE_TYPE.LoggerService) private loggerService: ILoggerService
  ) {}

  async login(email: string, password: string) {
    try {
      this.validateCredentials(email, password);

      const user = await this.getUserByEmail(email);

      await this.verifyPassword(password, user.password);

      this.verifyEmailVerification(user.emailVerified, email);

      this.loggerService.info(`User with email ${email} logged in`, { service: AuthService.name });

      return this.getUserResponse(user);
    } catch (error) {
      throw error;
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
    };
  }
}
