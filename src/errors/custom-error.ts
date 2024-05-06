import { STATUS_CODES } from './statusCodes';

/**
 * CustomError is an abstract class that is used to create custom error classes.
 */

export abstract class CustomError extends Error {
  abstract readonly statusCode: STATUS_CODES;
  abstract readonly context: { [key: string]: any };

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, CustomError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  abstract serializeErrors(): { message: string; context: { [key: string]: any } }[];
}
