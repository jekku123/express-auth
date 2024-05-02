import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import { ILoggerService } from '../types/ILoggerService';
import { ISessionService } from '../types/ISessionService';
import { ITokenService } from '../types/ITokenService';
import { IUserService } from '../types/IUserService';

@injectable()
export class AuthService implements IAuthService {
  private userService: IUserService;
  private tokenService: ITokenService;
  private loggerService: ILoggerService;
  private sessionService: ISessionService;

  constructor(
    @inject(INTERFACE_TYPE.UserService) userService: IUserService,
    @inject(INTERFACE_TYPE.TokenService) tokenService: ITokenService,
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.SessionService) sessionService: ISessionService
  ) {
    this.userService = userService;
    this.tokenService = tokenService;
    this.loggerService = loggerService;
    this.sessionService = sessionService;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, { email });
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED, {
        email,
      });
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

  async verifyEmail(token: string) {
    if (!token) {
      throw new AppError(ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
    }

    const existingToken = await this.tokenService.findTokenByToken(token);

    if (!existingToken) {
      throw new AppError('Verification token not found', STATUS_CODES.NOT_FOUND);
    }

    const hasExpired = existingToken.expiresAt < new Date(Date.now());

    if (hasExpired) {
      throw new AppError('Verification token expired', STATUS_CODES.UNAUTHORIZED);
    }

    const existingUser = await this.userService.getUserByEmail(existingToken.identifier);

    if (!existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND, {
        email: existingToken.identifier,
      });
    }

    await this.userService.setEmailVerified(existingUser._id);
    await this.tokenService.deleteToken(existingToken.token);

    this.loggerService.info(
      `User with email ${existingUser.email} has verified an account`,
      AuthService.name
    );
  }
}
