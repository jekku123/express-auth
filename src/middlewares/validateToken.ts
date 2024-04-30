import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';

import AppError from '../config/errors/AppError';
import { ERROR_MESSAGES } from '../config/errors/errorMessages';
import { STATUS_CODES } from '../config/errors/statusCodes';
import Account from '../models/account';
import User from '../models/user';

export const JWT_SECRET: Secret = Bun.env.ACCESS_TOKEN_SECRET as string;

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

    const account = await Account.findOne({ accessToken: token });

    if (!account) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }

    const user = await User.findById(account.userId);

    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, STATUS_CODES.UNAUTHORIZED);
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
