import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import 'reflect-metadata';
import { corsOptions } from './config/corsOptions';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import testRoutes from './routes/test';
import userRoutes from './routes/user';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/test', testRoutes);

app.use(errorHandler);

export default app;
