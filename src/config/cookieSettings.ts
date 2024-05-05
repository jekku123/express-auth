import { CookieOptions } from 'express';

export const SESSION_ID_EXPIRES = 2 * 60 * 1000;
export const SESSION_EXPIRATION_THRESHOLD = 1 * 60 * 1000;

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
