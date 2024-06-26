import { CookieOptions } from 'express';
import { SESSION_ID_EXPIRES } from './constants';

type CookieSettings = {
  httpOnly: CookieOptions;
};

export const cookieSettings: CookieSettings = {
  httpOnly: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: SESSION_ID_EXPIRES,
  },
};
