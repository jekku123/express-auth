import { NextFunction, Request, Response } from 'express';

export interface IAuthController {
  onLogin(req: Request, res: Response, next: NextFunction): Promise<void>;

  onLogout(req: Request, res: Response, next: NextFunction): Promise<any>; // TODO: fix any
}
