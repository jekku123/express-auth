import { Container } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import UserRepository from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import EmailVerificationService from '../services/email-verfification.service';
import LoggerService from '../services/logger.service';
import MailerService from '../services/mailer.service';
import { UserService } from '../services/user.service';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { IUserController } from '../types/IUserController';
import { IUserRepository } from '../types/IUserRepository';
import { IUserService } from '../types/IUserService';

import PasswordResetRepository from '../repositories/password-reset.repository';
import EmailVerificationRepository from '../repositories/verification.repository';
import PasswordResetService from '../services/password-reset.service';
import { IEmailVerificationRepository } from '../types/IEmailVerificationRepository';
import { IEmailVerificationService } from '../types/IEmailVerificationService';
import { IPasswordResetRepository } from '../types/IPasswordResetRepository';
import { IPasswordResetService } from '../types/IPasswordResetService';

const container = new Container();

container.bind<IAuthController>(INTERFACE_TYPE.AuthController).to(AuthController);
container.bind<IUserController>(INTERFACE_TYPE.UserController).to(UserController);

container.bind<IAuthService>(INTERFACE_TYPE.AuthService).to(AuthService);
container.bind<IMailerService>(INTERFACE_TYPE.MailerService).to(MailerService);
container
  .bind<IEmailVerificationService>(INTERFACE_TYPE.EmailVerificationService)
  .to(EmailVerificationService);
container.bind<ILoggerService>(INTERFACE_TYPE.LoggerService).to(LoggerService);
container.bind<IPasswordResetService>(INTERFACE_TYPE.PasswordResetService).to(PasswordResetService);
container.bind<IUserService>(INTERFACE_TYPE.UserService).to(UserService);

container.bind<IUserRepository>(INTERFACE_TYPE.UserRepository).to(UserRepository);
container
  .bind<IEmailVerificationRepository>(INTERFACE_TYPE.EmailVerificationRepository)
  .to(EmailVerificationRepository);
container
  .bind<IPasswordResetRepository>(INTERFACE_TYPE.PasswordResetRepository)
  .to(PasswordResetRepository);

export default container;
