import { NextFunction, Request, Response } from 'express';

export interface IAuthController {
  onLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  onLogout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined>;
  onRefreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  onVerifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined>;
  onResetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
