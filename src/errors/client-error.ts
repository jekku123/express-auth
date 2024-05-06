import { CustomError } from './custom-error';
import { ERROR_MESSAGES } from './error-messages';
import { STATUS_CODES } from './statusCodes';

export abstract class ClientError extends CustomError {
  protected readonly _context: { [key: string]: any };
  protected readonly _statusCode: STATUS_CODES;

  constructor(message: string, statusCode: STATUS_CODES, context?: { [key: string]: any }) {
    super(message);
    this._statusCode = statusCode;
    this._context = context || {};

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ClientError.prototype);
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

export class BadRequestError extends ClientError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST, context);
  }
}

export class ConflictError extends ClientError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.CONFLICT, STATUS_CODES.CONFLICT, context);
  }
}

export class NotFoundError extends ClientError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND, context);
  }
}
