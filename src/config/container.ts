import { Container } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { AuthController } from '../controllers/auth.controller';
import { UserController } from '../controllers/user.controller';
import { AuthService } from '../services/auth.service';
import Logger from '../services/logger.service';
import MailerService from '../services/mailer.service';
import TokenService from '../services/token.service';
import { UserService } from '../services/user.service';
import { IAuthController } from '../types/IAuthController';
import { IAuthService } from '../types/IAuthService';
import { ILoggerService } from '../types/ILoggerService';
import { IMailerService } from '../types/IMailerService';
import { ITokenService } from '../types/ITokenService';
import { IUserController } from '../types/IUserController';
import { IUserService } from '../types/IUserService';

const container = new Container();

container.bind<IAuthController>(INTERFACE_TYPE.AuthController).to(AuthController);
container.bind<IUserController>(INTERFACE_TYPE.UserController).to(UserController);

container.bind<IAuthService>(INTERFACE_TYPE.AuthService).to(AuthService);
container.bind<IUserService>(INTERFACE_TYPE.UserService).to(UserService);
container.bind<IMailerService>(INTERFACE_TYPE.MailerService).to(MailerService);
container.bind<ITokenService>(INTERFACE_TYPE.TokenService).to(TokenService);

container.bind<ILoggerService>(INTERFACE_TYPE.Logger).to(Logger);

export default container;
