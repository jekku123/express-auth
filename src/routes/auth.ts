import express from 'express';
import { Container } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import Logger from '../services/logger.service';
import { TokenService } from '../services/token.service';
import { IAuthService } from '../types/IAuthService';
import { ILogger } from '../types/ILogger';
import { ITokenService } from '../types/ITokenService';

const router = express.Router();

const container = new Container();

container.bind(INTERFACE_TYPE.AuthController).to(AuthController);

container.bind<ILogger>(INTERFACE_TYPE.Logger).to(Logger);
container.bind<IAuthService>(INTERFACE_TYPE.AuthService).to(AuthService);
container.bind<ITokenService>(INTERFACE_TYPE.TokenService).to(TokenService);

const controller = container.get<AuthController>(INTERFACE_TYPE.AuthController);

router.post('/login', controller.onLogin.bind(controller));
router.get('/refresh', controller.onRefreshToken.bind(controller));
router.post('/verify-email', controller.onVerifyEmail.bind(controller));

router.get('/test', controller.onTest.bind(controller));

router.get('/logout', controller.onLogout.bind(controller));

export default router;
