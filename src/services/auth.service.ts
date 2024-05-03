import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import { IAccountService } from '../types/IAccountService';
import { ILoggerService } from '../types/ILoggerService';
import { ISessionService } from '../types/ISessionService';
import { ITokenService } from '../types/ITokenService';
import { IUserService } from '../types/IUserService';
import { IVerificationService } from '../types/IVerificationService';

@injectable()
export class AuthService implements IAuthService {
  private userService: IUserService;
  private verificationService: IVerificationService;
  private loggerService: ILoggerService;
  private sessionService: ISessionService;
  private tokenService: ITokenService;
  private accountService: IAccountService;

  constructor(
    @inject(INTERFACE_TYPE.UserService) userService: IUserService,
    @inject(INTERFACE_TYPE.VerificationService) verificationService: IVerificationService,
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.SessionService) sessionService: ISessionService,
    @inject(INTERFACE_TYPE.TokenService) tokenService: ITokenService,
    @inject(INTERFACE_TYPE.AccountService) accountService: IAccountService
  ) {
    this.userService = userService;
    this.verificationService = verificationService;
    this.loggerService = loggerService;
    this.sessionService = sessionService;
    this.tokenService = tokenService;
    this.accountService = accountService;
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

    const userId = user._id;

    const accessToken = this.tokenService.generateAccessToken();
    const refreshToken = this.tokenService.generateRefreshToken();

    await this.accountService.updateOrCreateAccount(userId, {
      userId,
      refreshToken: refreshToken.token,
      accessToken: accessToken.token,
      expiresAt: new Date(accessToken.expiresAt),
      tokenType: 'Bearer ',
    });

    const session = await this.sessionService.createSession(userId);

    return {
      user: {
        id: userId,
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

    const existingToken = await this.verificationService.findTokenByToken(token);

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
    await this.verificationService.deleteToken(existingToken.token);

    this.loggerService.info(
      `User with email ${existingUser.email} has verified an account`,
      AuthService.name
    );
  }
}
