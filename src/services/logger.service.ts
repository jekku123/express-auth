import { injectable } from 'inversify';
import winston, { createLogger, format, transports } from 'winston';

@injectable()
/**
 * LoggerService
 * Service for logging messages to the console and to log files.
 * Uses Winston for logging.
 * Logs messages at different levels, such as info and error.
 * Logs messages to different files based on the log level.
 * Logs messages to the console in development mode.
 */
export default class LoggerService {
  /**
   * The Winston logger instance used for logging messages.
   */
  private logger: winston.Logger;

  /**
   * Creates a new instance of the LoggerService class.
   * Configures the Winston logger with different transports for logging to files and the console.
   */
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
        new transports.File({ filename: 'logs/info.log', level: 'info' }),
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

  /**
   * Logs an info message to the console and to the info log file.
   * @param message
   * @param meta
   */
  info(message: string, ...meta: any[]) {
    this.logger.info(message, meta);
  }

  /**
   * Logs an error message to the console and to the error log file.
   * @param error
   */
  error(error: any) {
    this.logger.error(error);
  }
}
