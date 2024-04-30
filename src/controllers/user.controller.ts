import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { IUserService } from '../types/IUserService';

@injectable()
export class UserController {
  private userService: IUserService;

  constructor(@inject(INTERFACE_TYPE.UserService) userService: IUserService) {
    this.userService = userService;
  }

  async onRegister(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const user = await this.userService.register(email, password);
      res.status(201).send(user);
    } catch (error) {
      next(error);
    }
  }

  async onGetUserProfile(req: Request, res: Response, next: NextFunction) {
    const id = req.user.id;
    try {
      const userProfile = await this.userService.getUserProfile(id);
      res.status(200).send(userProfile);
    } catch (error) {
      next(error);
    }
  }

  async onUpdatePassword(req: Request, res: Response, next: NextFunction) {
    const { email, oldPassword, newPassword } = req.body;
    try {
      const user = await this.userService.updatePassword(email, oldPassword, newPassword);
      res.status(200).send(user);
    } catch (error) {
      next(error);
    }
  }
}
