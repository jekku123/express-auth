import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';

import AppError from '../config/errors/AppError';
import { STATUS_CODES } from '../config/errors/statusCodes';
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
      if (req.session.user) {
        throw new AppError('Already logged in', STATUS_CODES.BAD_REQUEST);
      }
      const { user } = await this.authService.login(email, password);

      req.session.user = {
        email: user.email,
        id: user.id,
        isLoggedIn: true,
      };

      req.session.save();
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
    console.log('SESSION USER BEFORE LOGOUT: ', req.session.user);

    try {
      req.session.destroy((error) => {
        if (error) {
          return next(error);
        }
      });

      console.log('SESSION USER AFTER LOGOUT: ', req.session);

      res.clearCookie('connect.sid');
      res.status(201).send({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route GET /api/auth/test
   */
  async onTest(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await User.find({});
      const verificationTokens = await VerificationToken.find({});

      res.status(STATUS_CODES.OK).send({ users, verificationTokens });
    } catch (error) {
      next(error);
    }
  }
}
