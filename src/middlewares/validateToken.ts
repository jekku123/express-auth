import { NextFunction, Request, Response } from 'express';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Session from '../models/session';

export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || (req.headers.Authorization as string);

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(ERROR_MESSAGES.MISSING_TOKEN, STATUS_CODES.BAD_REQUEST);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(ERROR_MESSAGES.MISSING_TOKEN, STATUS_CODES.BAD_REQUEST);
    }

    const session = await Session.findOne({ sessionId: token });

    if (!session) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }

    next();
  } catch (error) {
    next(error);
  }
};
