import { injectable } from 'inversify';
import winston, { createLogger, format, transports } from 'winston';

// export const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.errors({ stack: true }),
//     format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
//     format.printf(({ timestamp, level, message, stack }) => {
//       const text = `${timestamp} ${level.toUpperCase()} ${message}`;
//       return stack ? text + '\n' + stack : text;
//     })
//   ),
//   transports: [
//     new transports.File({
//       filename: 'logs/error.log',
//       level: 'error',
//     }),
//     new transports.File({ filename: 'logs/info.log', level: 'info' }),
//     new transports.File({ filename: 'logs/combined.log' }),
//   ],
// });

// if (process.env.NODE_ENV !== 'production') {
//   logger.add(
//     new transports.Console({
//       format: format.prettyPrint(),
//     })
//   );
// }

@injectable()
export default class Logger {
  private logger: winston.Logger;

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.errors({ stack: true }),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, stack }) => {
          const text = `${timestamp} ${level.toUpperCase()} ${message}`;
          return stack ? text + '\n' + stack : text;
        })
      ),
      transports: [
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new transports.File({ filename: 'logs/combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.prettyPrint(),
        })
      );
    }
  }

  info(message: string, ...meta: any[]) {
    this.logger.info(message, meta);
  }

  error(error: any) {
    this.logger.error(error);
  }
}
