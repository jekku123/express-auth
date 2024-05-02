import { Request, Response } from 'express';
import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { ILoggerService } from '../types/ILoggerService';

import container from '../config/container';
import { INTERFACE_TYPE } from '../config/dependencies';

const createErrorHandler = (logger: ILoggerService) => {
  return (err: Error, _req: Request, res: Response) => {
    // Log the error
    logger.error(err);

    // Handle the error based on its type
    if (err instanceof AppError) {
      const { statusCode, message, context, stack } = err;

      res.status(statusCode).send({
        statusCode,
        success: false,
        errors: {
          message,
          stack: Bun.env.NODE_ENV === 'production' ? undefined : stack,
          context,
        },
      });

      return;
    }

    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send({
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      success: false,
      errors: {
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        stack: Bun.env.NODE_ENV === 'production' ? undefined : err.stack,
      },
    });

    return;
  };
};

const logger = container.get<ILoggerService>(INTERFACE_TYPE.Logger);
export const errorHandler = createErrorHandler(logger);
