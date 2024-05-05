import MongoStore from 'connect-mongo';
import { SessionOptions } from 'express-session';
import 'reflect-metadata';

const MONGO_URI = Bun.env.MONGO_URI as string;

const sessionStore = MongoStore.create({
  mongoUrl: MONGO_URI,
  crypto: {
    secret: 'mysupercryptosecretkey2000',
  },
}) as MongoStore;

export const sessionOptions = {
  secret: 'mysupersecrettestkey2000',
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 7,
  },
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
} satisfies SessionOptions;
