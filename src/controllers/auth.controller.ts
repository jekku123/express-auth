import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import { STATUS_CODES } from '../config/errors/statusCodes';
import Account from '../models/account';
import Session from '../models/session';
import User from '../models/user';
import VerificationToken from '../models/verificationToken';
import { IAuthService } from '../types/IAuthService';

@injectable()
export class AuthController {
  private authService: IAuthService;

  constructor(@inject(INTERFACE_TYPE.AuthService) authService: IAuthService) {
    this.authService = authService;
  }

  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   * @access Public
   */
  async onLogin(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const { accessToken, refreshToken } = await this.authService.login(email, password);

      res.cookie('refreshToken', refreshToken.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(STATUS_CODES.OK).send({ accessToken: accessToken.token });
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
   * @route GET /api/auth/logout
   * @desc Logout
   * @access Public
   */
  async onLogout(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies;
    const userId = req.user.id;

    if (!cookies?.refreshToken) {
      return res.sendStatus(STATUS_CODES.NO_CONTENT);
    }

    this.authService.logout(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(STATUS_CODES.OK).send({ message: 'Logged out' });
  }

  /**
   * @route GET /api/auth/verify-email
   */

  async onVerifyEmail(req: Request, res: Response, next: NextFunction) {
    const { userId, token } = req.query;

    try {
      await this.authService.verifyEmail(userId as string, token as string);
      res.status(STATUS_CODES.OK).send({ message: 'Email verified' });
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
  async onTest(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({});
      const accounts = await Account.find({});
      const verificationTokens = await VerificationToken.find({});
      const sessions = await Session.find({});

      res.status(STATUS_CODES.OK).send({ users, accounts, verificationTokens, sessions });
    } catch (error) {
      next(error);
    }
  }
}
