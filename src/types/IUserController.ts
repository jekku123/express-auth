import { NextFunction, Request, Response } from 'express';

export interface IUserController {
  onRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
  onGetUserProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  onUpdatePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
