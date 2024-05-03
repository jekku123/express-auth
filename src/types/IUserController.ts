import { NextFunction, Request, Response } from 'express';

export interface IUserController {
  onRegister(req: Request, res: Response, next: NextFunction): Promise<void>;
  onGetUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined>;
  onUpdatePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
