import { NextFunction, Request, Response } from 'express';
import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { ILoggerService } from '../types/ILoggerService';

import container from '../container';
import { INTERFACE_TYPE } from '../container/dependencies';

const createErrorHandler = (logger: ILoggerService) => {
  return (err: Error, _req: Request, res: Response, next: NextFunction) => {
    // Log the error
    logger.error(err);

    // Handle the error based on its type
    if (err instanceof AppError) {
      const { statusCode, message, context, stack } = err;

      return res.status(statusCode).send({
        statusCode,
        success: false,
        errors: {
          message,
          stack: Bun.env.NODE_ENV === 'production' ? undefined : stack,
          context,
        },
      });
    }

    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send({
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      success: false,
      errors: {
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        stack: Bun.env.NODE_ENV === 'production' ? undefined : err.stack,
      },
    });
  };
};

const logger = container.get<ILoggerService>(INTERFACE_TYPE.LoggerService);
export const errorHandler = createErrorHandler(logger);
