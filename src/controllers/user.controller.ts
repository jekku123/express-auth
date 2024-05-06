import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../container/dependencies';
import { BadRequestError } from '../errors/client-error';
import { ERROR_MESSAGES } from '../errors/error-messages';
import { STATUS_CODES } from '../errors/statusCodes';
import { IUserController } from '../types/IUserController';
import { IUserService } from '../types/IUserService';

@injectable()
/**
 * UserController
 * Controller for user routes
 * @route /api/user
 */
export class UserController implements IUserController {
  /**
   * Constructs a new UserController
   * @param userService - Service for user operations
   */
  constructor(@inject(INTERFACE_TYPE.UserService) private userService: IUserService) {}

  /**
   * Handles user registration
   * @access Public
   * @POST /api/user/register
   */
  async onRegister(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.register(email, password);
      res.status(201).send({ message: 'User registered', user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles email verification
   * @access Public
   * @POST /api/user/verify-email
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
   * Handles getting user profile
   * @access Private
   * @GET /api/user
   */
  async onGetUser(req: Request, res: Response, next: NextFunction) {
    const id = req.user.id;
    try {
      const userProfile = await this.userService.findUserById(id);
      if (!userProfile) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send(userProfile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating user password
   * @access Private
   * @PUT /api/user/update-password
   */
  async onUpdatePassword(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;

    const { oldPassword, newPassword } = req.body;
    try {
      const user = await this.userService.updatePassword(userId, oldPassword, newPassword);
      res.status(200).send({
        message: 'Password updated',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles sending password reset link to email
   * @access Public
   * @POST /api/user/forgot-password
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
   * Handles resetting user password
   * @access Public
   * @POST /api/user/reset-password
   */
  async onResetPassword(req: Request, res: Response, next: NextFunction) {
    const query = req.query;
    const { password } = req.body;

    if (!query?.token) {
      throw new BadRequestError(ERROR_MESSAGES.INVALID_TOKEN);
    }

    try {
      await this.userService.resetPassword(query.token as string, password);
      res.status(STATUS_CODES.OK).send({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
}
