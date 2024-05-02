import { Container } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import { UserEntity } from '../entities/user.entity';
import SessionRepository from '../repositories/session.repository';
import TokenRepository from '../repositories/token.repository';
import UserRepository from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import LoggerService from '../services/logger.service';
import MailerService from '../services/mailer.service';
import { SessionService } from '../services/session.service';
import TokenService from '../services/token.service';
import { UserService } from '../services/user.service';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { ISessionRepository } from '../types/ISessionRepository';
import { ISessionService } from '../types/ISessionService';
import { ITokenRepository } from '../types/ITokenRepository';
import { ITokenService } from '../types/ITokenService';
import { IUserController } from '../types/IUserController';
import { IUserEntity } from '../types/IUserEntity';
import { IUserRepository } from '../types/IUserRepository';
import { IUserService } from '../types/IUserService';

const container = new Container();

container.bind<IAuthController>(INTERFACE_TYPE.AuthController).to(AuthController);
container.bind<IUserController>(INTERFACE_TYPE.UserController).to(UserController);

container.bind<IAuthService>(INTERFACE_TYPE.AuthService).to(AuthService);
container.bind<IUserService>(INTERFACE_TYPE.UserService).to(UserService);
container.bind<IMailerService>(INTERFACE_TYPE.MailerService).to(MailerService);
container.bind<ITokenService>(INTERFACE_TYPE.TokenService).to(TokenService);
container.bind<ILoggerService>(INTERFACE_TYPE.LoggerService).to(LoggerService);
container.bind<ISessionService>(INTERFACE_TYPE.SessionService).to(SessionService);

container.bind<IUserRepository>(INTERFACE_TYPE.UserRepository).to(UserRepository);
container.bind<ITokenRepository>(INTERFACE_TYPE.TokenRepository).to(TokenRepository);
container.bind<ISessionRepository>(INTERFACE_TYPE.SessionRepository).to(SessionRepository);

container.bind<IUserEntity>(INTERFACE_TYPE.UserEntity).to(UserEntity);

export default container;
