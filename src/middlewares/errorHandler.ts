import { Request, Response } from 'express';
import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import { ILogger } from '../types/ILogger';

import { MongooseError } from 'mongoose';
import container from '../config/container';
import { INTERFACE_TYPE } from '../config/dependencies';

const createErrorHandler = (logger: ILogger) => {
  return (err: Error, req: Request, res: Response) => {
    // Log the error
    logger.error(err);

    // Handle AppError instances
    if (err instanceof AppError) {
      const { statusCode } = err;

      return res.status(statusCode).send({
        statusCode,
        success: false,
        errors: {
          message: err.message,
          stack: req.app.get('env') === 'production' ? undefined : err.stack,
          context: err.context,
        },
      });
    }

    // Handle Mongoose error instances
    if (err instanceof MongooseError) {
      return res.status(STATUS_CODES.UNAUTHORIZED).send({
        statusCode: STATUS_CODES.UNAUTHORIZED,
        success: false,
        errors: {
          message: err.message,
          stack: req.app.get('env') === 'production' ? undefined : err.stack,
        },
      });
    }

    // Handle all other errors
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send({
      statusCode: STATUS_CODES.INTERNAL_SERVER_ERROR,
      success: false,
      errors: {
        message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        stack: req.app.get('env') === 'production' ? undefined : err.stack,
      },
    });
  };
};

// Resolve the ILogger instance from the container
const logger = container.get<ILogger>(INTERFACE_TYPE.Logger);

// Create the error handler middleware with the injected logger
export const errorHandler = createErrorHandler(logger);
