import { NextFunction, Request, Response } from 'express';

import { cookieSettings } from '../config/cookieSettings';

import { SESSION_EXPIRATION_THRESHOLD } from '../config/constants';
import container from '../container';
import { INTERFACE_TYPE } from '../container/dependencies';
import { UnauthorizedError } from '../errors/auth-error';
import { BadRequestError } from '../errors/client-error';
import { ERROR_MESSAGES } from '../errors/error-messages';
import { ISessionService } from '../types/ISessionService';

export const createSessionValidator = (sessionService: ISessionService) =>
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = req.cookies;

      if (!cookies?.sessionId) {
        throw new BadRequestError(ERROR_MESSAGES.MISSING_SESSION_ID);
      }

      const session = await sessionService.getSessionById(cookies.sessionId);

      if (!session) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_SESSION_ID);
      }

      const now = Date.now();
      const timeLeft = new Date(session.expiresAt).getTime() - now;

      if (timeLeft <= SESSION_EXPIRATION_THRESHOLD) {
        const newSession = await sessionService.createSession(session.userId.toString());
        await sessionService.deleteSession(session.sessionId);

        res.cookie('sessionId', newSession.sessionId, cookieSettings.httpOnly);
      }

      req.user = { id: session.userId.toString() };

      next();
    } catch (error) {
      next(error);
    }
  };

const sessionService = container.get<ISessionService>(INTERFACE_TYPE.SessionService);
export const sessionValidator = createSessionValidator(sessionService);
