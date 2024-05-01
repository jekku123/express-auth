import express from 'express';
import { Container } from 'inversify';
import { INTERFACE_TYPE } from '../config/dependencies';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';

import { validateSession } from '../middlewares/validateSession';
import Logger from '../services/logger.service';
import { ILogger } from '../types/ILogger';
import { IUserService } from '../types/IUserService';

const router = express.Router();

const container = new Container();

container.bind(INTERFACE_TYPE.UserController).to(UserController);
container.bind<IUserService>(INTERFACE_TYPE.UserService).to(UserService);
container.bind<ILogger>(INTERFACE_TYPE.Logger).to(Logger);

const controller = container.get<UserController>(INTERFACE_TYPE.UserController);

router.post('/register', controller.onRegister.bind(controller));

router.use(validateSession);

router.get('/', controller.onGetUserProfile.bind(controller));
router.put('/', controller.onUpdatePassword.bind(controller));

export default router;
