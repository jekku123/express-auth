import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
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
      const user = await this.userService.createUser(email, password);
      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @desc For testing purposes
   */
  async onGetUserProfile(req: Request, res: Response, next: NextFunction) {
    const id = req.user.id;
    try {
      const userProfile = await this.userService.getUserProfile(id);
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
}
