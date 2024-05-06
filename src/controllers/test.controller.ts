import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { INTERFACE_TYPE } from '../container/dependencies';

import { STATUS_CODES } from '../errors/statusCodes';
import { IEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { ISessionRepository } from '../types/ISessionRepository';
import { IUserRepository } from '../types/IUserRepository';

export interface ITestController {
  onTest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}

@injectable()
/**
 * TestController
 * Controller for authentication routes
 * @route /api/auth
 */
export class TestController implements ITestController {
  /**
   * Constructs a new TestController
   * @param email - Repository for email verification operations
   * @param user - Repository for user operations
   * @param password - Repository for password reset operations
   * @param session - Repository for session operations
   */
  constructor(
    @inject(INTERFACE_TYPE.EmailVerificationRepository) private email: IEmailVerificationRepository,
    @inject(INTERFACE_TYPE.UserRepository) private user: IUserRepository,
    @inject(INTERFACE_TYPE.PasswordResetRepository) private password: IPasswordResetRepository,
    @inject(INTERFACE_TYPE.SessionRepository) private session: ISessionRepository
  ) {}

  /**
   * For testing purposes
   * @access Public
   * @GET /api/test
   */
  async onTest(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.user.findMany({});
      const emailVerifications = await this.email.findMany({});
      const sessions = await this.session.findMany({});
      const passwordResetTokens = await this.password.findMany({});

      res
        .status(STATUS_CODES.OK)
        .send({ users, emailVerifications, sessions, passwordResetTokens });
    } catch (error) {
      next(error);
    }
  }
}
