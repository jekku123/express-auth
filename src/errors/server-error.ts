import { CustomError } from './custom-error';
import { ERROR_MESSAGES } from './error-messages';
import { STATUS_CODES } from './statusCodes';

export abstract class ServerError extends CustomError {
  protected readonly _statusCode: STATUS_CODES;
  protected readonly _context: { [key: string]: any };

  constructor(message: string, statusCode: STATUS_CODES, context?: { [key: string]: any }) {
    super(message);
    this._statusCode = statusCode;
    this._context = context || {};

    Object.setPrototypeOf(this, ServerError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  get context() {
    return this._context;
  }

  get statusCode() {
    return this._statusCode;
  }

  serializeErrors() {
    return [{ message: this.message, context: this.context }];
  }
}

export class InternalServerError extends ServerError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(
      message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      STATUS_CODES.INTERNAL_SERVER_ERROR,
      context
    );
  }
}
