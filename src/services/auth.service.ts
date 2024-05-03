import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { IAuthService } from '../types/IAuthService';

import { IEmailVerificationService } from '../types/IEmailVerificationService';
import { ILoggerService } from '../types/ILoggerService';
import { IPasswordResetService } from '../types/IPasswordResetService';
import { ISessionService } from '../types/ISessionService';
import { IUserService } from '../types/IUserService';

@injectable()
export class AuthService implements IAuthService {
  private userService: IUserService;
  private emailVerificationService: IEmailVerificationService;
  private loggerService: ILoggerService;
  private sessionService: ISessionService;
  private passwordResetService: IPasswordResetService;

  constructor(
    @inject(INTERFACE_TYPE.UserService) userService: IUserService,
    @inject(INTERFACE_TYPE.EmailVerificationService)
    emailVerificationService: IEmailVerificationService,
    @inject(INTERFACE_TYPE.LoggerService) loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.SessionService) sessionService: ISessionService,
    @inject(INTERFACE_TYPE.PasswordResetService) passwordResetService: IPasswordResetService
  ) {
    this.userService = userService;
    this.emailVerificationService = emailVerificationService;
    this.loggerService = loggerService;
    this.sessionService = sessionService;
    this.passwordResetService = passwordResetService;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new AppError(ERROR_MESSAGES.MISSING_CREDENTIALS, STATUS_CODES.BAD_REQUEST);
    }

    const keke = await this.userService.getUser({ email });

    if (!keke) {
      throw new AppError('User not found', STATUS_CODES.NOT_FOUND, { email });
    }

    const user = await this.userService.verifyCredentials(keke.email, password);

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
    const verification = await this.emailVerificationService.useVerificationToken(token);
    const existingUser = await this.userService.getUser({ email: verification.identifier });

    if (!existingUser) {
      throw new AppError(
        'Verification token not used, email not found',
        STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }

    await this.userService.setEmailVerified(existingUser._id);

    this.loggerService.info(
      `User with email ${verification.identifier} has verified an account`,
      AuthService.name
    );
  }
}
