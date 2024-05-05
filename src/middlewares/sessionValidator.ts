import { NextFunction, Request, Response } from 'express';

import { SESSION_EXPIRATION_THRESHOLD, cookieSettings } from '../config/cookieSettings';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import container from '../container';
import { INTERFACE_TYPE } from '../container/dependencies';
import { ISessionService } from '../types/ISessionService';

export const createSessionValidator = (sessionService: ISessionService) =>
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = req.cookies;

      if (!cookies?.sessionId) {
        throw new AppError(ERROR_MESSAGES.MISSING_SESSION_ID, STATUS_CODES.BAD_REQUEST);
      }

      const session = await sessionService.getSessionById(cookies.sessionId);

      if (!session) {
        throw new AppError(ERROR_MESSAGES.INVALID_SESSION_ID, STATUS_CODES.UNAUTHORIZED);
      }

      const now = Date.now();
      const timeLeft = new Date(session.expiresAt).getTime() - now;

      console.log('SessionID expires in: ', timeLeft);
      console.log('Session id threshold in: ', timeLeft - SESSION_EXPIRATION_THRESHOLD);

      if (timeLeft <= SESSION_EXPIRATION_THRESHOLD) {
        console.log('Session threshold reached, creating new session');

        const newSession = await sessionService.createSession(session.userId);

        console.log('New session created');

        await sessionService.deleteSession(session.sessionId);
        console.log('Old session deleted');

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
