import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import { cookieSettings } from '../config/cookieSettings';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Session from '../models/session';
import User from '../models/user';
import VerificationToken from '../models/verificationToken';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';

/**
 * @route /api/auth
 * @desc Controller for authentication routes
 * @access Public
 * @param {IAuthService} authService - Service for authentication
 */
@injectable()
export class AuthController implements IAuthController {
  private authService: IAuthService;

  constructor(@inject(INTERFACE_TYPE.AuthService) authService: IAuthService) {
    this.authService = authService;
  }

  /**
   * @route POST /api/auth/login
   * @desc Login
   * @access Public
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
   * @route GET /api/auth/logout
   * @desc Logout
   * @access Public
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
   * @route GET /api/auth/refresh
   * @desc Refresh access token
   * @access Public
   */
  async onRefreshToken(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies.refreshToken;
    console.log({ refreshToken: cookies });
    res.status(STATUS_CODES.OK).send({ cookies });

    // try {
    //   const refreshToken = cookies?.refreshToken;
    //   if (!refreshToken) {
    //     throw new AppError(ERROR_MESSAGES.MISSING_TOKEN, STATUS_CODES.BAD_REQUEST);
    //   }
    //   const accessToken = await this.authService.refreshToken(refreshToken);
    //   res.status(STATUS_CODES.OK).send({ accessToken });
    // } catch (error) {
    //   next(error);
    // }
  }

  /**
   * @route GET /api/auth/verify-email
   * @desc Verify email
   * @access Public
   */
  async onVerifyEmail(req: Request, res: Response, next: NextFunction) {
    const query = req.query;

    if (!query?.token) {
      return res.sendStatus(STATUS_CODES.NO_CONTENT);
    }

    try {
      await this.authService.verifyEmail(query.token as string);
      res.status(STATUS_CODES.OK).send('Email verified');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/auth/forgot-password
   */

  // async onForgotPassword(req: Request, res: Response, next: NextFunction) {
  //   const { email } = req.body;

  //   try {
  //     await this.authService.forgotPassword(email);
  //     res.status(STATUS_CODES.OK).send({ message: 'Password reset link sent to email' });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * @route POST /api/auth/reset-password
   */
  // async onResetPassword(req: Request, res: Response, next: NextFunction) {
  //   const { token, password } = req.body;

  //   try {
  //     await this.authService.resetPassword(token, password);
  //     res.status(STATUS_CODES.OK).send({ message: 'Password reset successful' });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * @route POST /api/auth/test
   */
  async onTest(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({});
      const verificationTokens = await VerificationToken.find({});
      const sessions = await Session.find({});

      res.status(STATUS_CODES.OK).send({ users, verificationTokens, sessions });
    } catch (error) {
      next(error);
    }
  }
}
