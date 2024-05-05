import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { INTERFACE_TYPE } from '../container/dependencies';
import { IUserController } from '../types/IUserController';
import { IUserService } from '../types/IUserService';

/**
 * @route /api/user
 * @desc Controller for user routes
 * @access Public
 * @param {IUserService} userService - Service for user operations
 */
@injectable()
export class UserController implements IUserController {
  private userService: IUserService;

  constructor(@inject(INTERFACE_TYPE.UserService) userService: IUserService) {
    this.userService = userService;
  }

  /**
   * @route POST /api/user/register
   * @desc Register
   * @access Public
   */
  async onRegister(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.register(email, password);
      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/user/verify-email
   * @desc Verify email
   * @access Public
   */
  async onVerifyEmail(req: Request, res: Response, next: NextFunction) {
    const query = req.query;

    if (!query?.token) {
      return res.sendStatus(STATUS_CODES.NO_CONTENT);
    }

    try {
      await this.userService.verifyEmail(query.token as string);
      res.status(STATUS_CODES.OK).send('Email verified');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc For testing purposes
   */
  async onGetUser(req: Request, res: Response, next: NextFunction) {
    const id = req.user.id;
    try {
      const userProfile = await this.userService.getUser({ _id: id });
      if (!userProfile) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send(userProfile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route PUT /api/user/update-password
   * @desc Update password
   * @access Private
   */
  async onUpdatePassword(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;

    const { oldPassword, newPassword } = req.body;
    try {
      const user = await this.userService.updatePassword(userId, oldPassword, newPassword);
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/user/forgot-password
   */

  async onForgotPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;

    try {
      await this.userService.forgotPassword(email);
      res.status(200).send({ message: 'Password reset link sent to email' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route POST /api/user/reset-password
   */
  async onResetPassword(req: Request, res: Response, next: NextFunction) {
    const query = req.query;
    const { password } = req.body;

    if (!query?.token) {
      throw new AppError(ERROR_MESSAGES.MISSING_TOKEN, STATUS_CODES.BAD_REQUEST);
    }

    try {
      await this.userService.resetPassword(query.token as string, password);
      res.status(STATUS_CODES.OK).send({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
}
