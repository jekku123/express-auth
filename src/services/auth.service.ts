import { inject, injectable } from 'inversify';

import { ERROR_MESSAGES } from '../errors/error-messages';
import { IAuthService } from '../types/IAuthService';

import { ILoggerService } from '../types/ILoggerService';
import { IUserService } from '../types/IUserService';

import { INTERFACE_TYPE } from '../container/dependencies';
import { UnauthorizedError } from '../errors/auth-error';
import { BadRequestError, NotFoundError } from '../errors/client-error';
import { InternalServerError } from '../errors/server-error';
import { ISession } from '../models/session';
import { IUser } from '../models/user';
import { ISessionService } from '../types/ISessionService';
import { IUserResponse } from '../types/IUserResponse';

@injectable()
/**
 * AuthService
 * Service for managing authentication operations, such as user login and logout.
 * Interacts with UserService and SessionService to authenticate users and manage sessions.
 */
export class AuthService implements IAuthService {
  /**
   * Constructs a new AuthService.
   * @param userService - The user service to interact with user data.
   * @param loggerService - The logger service to log authentication events.
   * @param sessionService - The session service to manage user sessions.
   */
  constructor(
    @inject(INTERFACE_TYPE.UserService) private userService: IUserService,
    @inject(INTERFACE_TYPE.LoggerService) private loggerService: ILoggerService,
    @inject(INTERFACE_TYPE.SessionService) private sessionService: ISessionService
  ) {}

  /**
   * Authenticates a user with the provided email and password.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing the user's information and session ID.
   * @throws BadRequestError if the email or password is missing.
   * @throws NotFoundError if the user is not found.
   * @throws UnauthorizedError if the password is invalid or the email is not verified.
   * @throws InternalServerError if session creation fails.
   */
  async login(email: string, password: string) {
    this.validateCredentials(email, password);

    const user = await this.findUserByEmail(email);

    await this.verifyPassword(password, user.password);
    this.verifyEmailVerification(user.emailVerified, email);

    const sessionId = await this.startSession(user.id);

    this.loggerService.info(`User with email ${email} logged in`, { service: AuthService.name });

    return this.getUserResponse(user, sessionId);
  }

  /**
   * Logs out a user by deleting their session.
   * @param sessionId - The ID of the session to delete.
   * @throws InternalServerError if the session could not be deleted.
   */
  async logout(sessionId: string) {
    const logoutResult = await this.sessionService.deleteSession(sessionId);
    if (!logoutResult) {
      throw new InternalServerError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validates that email and password are not missing.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns void
   * @throws BadRequestError if either the email or password is missing.
   * @private
   */
  private validateCredentials(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestError(ERROR_MESSAGES.BAD_REQUEST);
    }
  }

  /**
   * Retrieves a user by their email address.
   * @param email - The user's email address.
   * @returns The user object.
   * @throws NotFoundError if the user is not found.
   * @private
   */
  private async findUserByEmail(email: string): Promise<IUser> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND, { email });
    }
    return user;
  }

  /**
   * Verifies that the provided password matches the stored password.
   * @param inputPassword - The password provided by the user.
   * @param storedPassword - The password stored for the user.
   * @throws UnauthorizedError if the password is invalid.
   * @private
   */
  private async verifyPassword(inputPassword: string, storedPassword: string) {
    const isPasswordValid = await Bun.password.verify(inputPassword, storedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  /**
   * Verifies that the user's email address has been verified.
   * @param emailVerified - Whether the user's email address has been verified.
   * @param email - The user's email address (for logging).
   * @throws UnauthorizedError if the email is not verified.
   * @private
   */
  private verifyEmailVerification(emailVerified: boolean, email: string) {
    if (!emailVerified) {
      throw new UnauthorizedError(ERROR_MESSAGES.EMAIL_NOT_VERIFIED, { email });
    }
  }

  /**
   * Starts a new session for the user with the given ID.
   * @param userId - The ID of the user.
   * @returns The session ID.
   * @throws InternalServerError if session creation fails.
   * @private
   */
  private async startSession(userId: IUser['id']): Promise<ISession['sessionId']> {
    const session = await this.sessionService.createSession(userId);
    if (!session) {
      throw new InternalServerError(ERROR_MESSAGES.SESSION_NOT_CREATED);
    }
    return session.sessionId;
  }

  /**
   * Constructs a user response object containing the user's information and session ID.
   * @param user - The user object.
   * @param sessionId - The session ID.
   * @returns An object containing the user's information and session ID.
   * @private
   */
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
