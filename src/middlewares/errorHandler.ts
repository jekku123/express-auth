import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Logger from '../services/logger.service';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = new Logger();

  if (err instanceof AppError) {
    const { statusCode } = err;
    logger.error(err);

    return res.status(statusCode).send({
      statusCode,
      success: false,
      errors: {
        message: err.message,
        stack: Bun.env.NODE_ENV === 'production' ? undefined : err.stack,
        context: err.context,
      },
    });
  }

  if (err instanceof JsonWebTokenError) {
    logger.error(err);

    return res.status(STATUS_CODES.UNAUTHORIZED).send({
      statusCode: STATUS_CODES.UNAUTHORIZED,
      success: false,
      errors: {
        message: err.message,
        stack: Bun.env.NODE_ENV === 'production' ? undefined : err.stack,
      },
    });
  }

  logger.error(err);

  return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send({
    statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
    success: false,
    errors: {
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      stack: Bun.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
  });
};
