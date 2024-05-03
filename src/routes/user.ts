import express from 'express';
import { INTERFACE_TYPE } from '../config/dependencies';
import { UserController } from '../controllers/user.controller';

import container from '../config/container';
import { validateSession } from '../middlewares/validateSession';

const router = express.Router();

const controller = container.get<UserController>(INTERFACE_TYPE.UserController);

router.post('/register', controller.onRegister.bind(controller));

router.use(validateSession);

router.get('/', controller.onGetUser.bind(controller));
router.put('/', controller.onUpdatePassword.bind(controller));

export default router;
