import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import { cookieSettings } from '../config/cookieSettings';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Session from '../models/session';
import User from '../models/user';
import VerificationToken from '../models/verification-token';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';

/**
 * @route /api/auth
 * @desc Controller for authentication routes
 * @access Public
 * @param {IAuthService} authService - Service for authentication operations
 * @POST /api/auth/login
 * @POST /api/auth/logout
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

  async onLogin2(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    const user = {
      email: 'keke@keke.com',
      id: '123',
      isLoggedIn: true,
    };

    try {
      // const { sessionId, user } = await this.authService.login(email, password);
      // req.session.user = {
      //   email: user.email,
      //   id: user.id,
      //   isLoggedIn: true,
      // };
      req.session.user = user;
      req.session.save();
      // res.cookie('sessionId', sessionId, cookieSettings.httpOnly);
      res.status(STATUS_CODES.OK).send(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/auth/logout
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

  // async onLogout(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     req.session.destroy((error) => {
  //       if (error) {
  //         return next(error);
  //       }
  //     });
  //     res.clearCookie('connect.sid');
  //     res.status(201).send({ message: 'Logged out' });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * @route GET /api/auth/test
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
