import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import 'reflect-metadata';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { corsOptions } from './config/corsOptions';
import userRoutes from './routes/user';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

// app.use(session(sessionOptions));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.use(errorHandler);

export default app;
