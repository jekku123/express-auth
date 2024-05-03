import { NextFunction, Request, Response } from 'express';

export interface IAuthController {
  onLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  onLogout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined>;
  onVerifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined>;
  onResetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  onForgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
