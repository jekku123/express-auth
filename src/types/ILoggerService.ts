export interface ILoggerService {
  info(message: string, ...meta: any[]): void;
  error(message: any): void;
}
