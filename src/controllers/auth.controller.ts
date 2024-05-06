import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../container/dependencies';

import { cookieSettings } from '../config/cookieSettings';
import { STATUS_CODES } from '../errors/statusCodes';
import EmailVerification from '../models/email-verification';
import PasswordReset from '../models/password-reset';
import Session from '../models/session';
import User from '../models/user';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';

@injectable()
/**
 * AuthController
 * Controller for authentication routes
 * @route /api/auth
 */
export class AuthController implements IAuthController {
  /**
   * Constructs a new AuthController
   * @param authService - Service for authentication operations
   */
  constructor(@inject(INTERFACE_TYPE.AuthService) private authService: IAuthService) {}

  /**
   * Handles user authentication of user login
   * @access Public
   * @POST /api/auth/login
   */
  async onLogin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const { sessionId, user } = await this.authService.login(email, password);
      res.cookie('sessionId', sessionId, cookieSettings.httpOnly);
      res.status(STATUS_CODES.OK).send(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user logout
   * @access Public
   * @POST /api/auth/logout
   */
  async onLogout(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies;

    if (!cookies?.sessionId) {
      return res.sendStatus(STATUS_CODES.NO_CONTENT);
    }

    try {
      this.authService.logout(cookies.sessionId);
      res.clearCookie('sessionId', cookieSettings.httpOnly);
      res.status(STATUS_CODES.OK).send({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * For testing purposes
   * @access Public
   * @GET /api/auth/test
   */
  async onTest(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({});
      const emailVerifications = await EmailVerification.find({});
      const sessions = await Session.find({});
      const passwordResetTokens = await PasswordReset.find({});

      res
        .status(STATUS_CODES.OK)
        .send({ users, emailVerifications, sessions, passwordResetTokens });
    } catch (error) {
      next(error);
    }
  }
}
