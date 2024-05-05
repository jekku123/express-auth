import { Container } from 'inversify';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import SessionRepository from '../repositories/session.repository';
import UserRepository from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import EmailVerificationService from '../services/email-verfification.service';
import LoggerService from '../services/logger.service';
import MailerService from '../services/mailer.service';
import { SessionService } from '../services/session.service';
import { UserService } from '../services/user.service';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';
import { IUserController } from '../types/IUserController';
import { IUserRepository } from '../types/IUserRepository';
import { IUserService } from '../types/IUserService';
import { INTERFACE_TYPE } from './dependencies';

import SessionCleanupJob from '../cron/session-cleanup-job';
import PasswordResetRepository from '../repositories/password-reset.repository';
import EmailVerificationRepository from '../repositories/verification.repository';
import PasswordResetService from '../services/password-reset.service';
import { IEmailEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IEmailVerificationService } from '../types/IEmailVerificationService';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { IPasswordResetService } from '../types/IPasswordResetService';
import { ISessionCleanupJob } from '../types/ISessionCleanupJob';

const container = new Container();

container.bind<IAuthController>(INTERFACE_TYPE.AuthController).to(AuthController);
container.bind<IUserController>(INTERFACE_TYPE.UserController).to(UserController);

container.bind<IAuthService>(INTERFACE_TYPE.AuthService).to(AuthService);
container.bind<IUserService>(INTERFACE_TYPE.UserService).to(UserService);
container.bind<IMailerService>(INTERFACE_TYPE.MailerService).to(MailerService);
container
  .bind<IEmailVerificationService>(INTERFACE_TYPE.EmailVerificationService)
  .to(EmailVerificationService);
container.bind<ILoggerService>(INTERFACE_TYPE.LoggerService).to(LoggerService);
container.bind<ISessionService>(INTERFACE_TYPE.SessionService).to(SessionService);
container.bind<IPasswordResetService>(INTERFACE_TYPE.PasswordResetService).to(PasswordResetService);

container.bind<IUserRepository>(INTERFACE_TYPE.UserRepository).to(UserRepository);
container
  .bind<IEmailEmailVerificationRepository>(INTERFACE_TYPE.EmailVerificationRepository)
  .to(EmailVerificationRepository);
container.bind<ISessionRepository>(INTERFACE_TYPE.SessionRepository).to(SessionRepository);
container
  .bind<IPasswordResetRepository>(INTERFACE_TYPE.PasswordResetRepository)
  .to(PasswordResetRepository);
container.bind<ISessionCleanupJob>(INTERFACE_TYPE.SessionCleanupJob).to(SessionCleanupJob);

export const sessionCleanupJob = container.get<ISessionCleanupJob>(
  INTERFACE_TYPE.SessionCleanupJob
);

export default container;
