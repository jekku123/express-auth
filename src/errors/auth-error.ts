import { CustomError } from './custom-error';
import { ERROR_MESSAGES } from './error-messages';
import { STATUS_CODES } from './statusCodes';

export abstract class AuthError extends CustomError {
  protected readonly _statusCode: STATUS_CODES;
  protected readonly _context: { [key: string]: any };

  constructor(message: string, statusCode: STATUS_CODES, context?: { [key: string]: any }) {
    super(message);
    this._statusCode = statusCode;
    this._context = context || {};

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AuthError.prototype);
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

export class UnauthorizedError extends AuthError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED, context);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.FORBIDDEN, STATUS_CODES.FORBIDDEN, context);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED, context);
  }
}

export class ExpiredTokenError extends AuthError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.TOKEN_EXPIRED, STATUS_CODES.UNAUTHORIZED, context);
  }
}

export class TokenValidationError extends AuthError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED, context);
  }
}

export class GoneError extends AuthError {
  constructor(message?: string, context?: { [key: string]: any }) {
    super(message || ERROR_MESSAGES.SESSION_EXPIRED, STATUS_CODES.GONE, context);
  }
}
