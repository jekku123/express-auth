import express from 'express';
import { INTERFACE_TYPE } from '../config/dependencies';
import { UserController } from '../controllers/user.controller';

import container from '../config/container';

const router = express.Router();

const controller = container.get<UserController>(INTERFACE_TYPE.UserController);

router.post('/register', controller.onRegister.bind(controller));

// router.use(validateSession);

router.get('/', controller.onGetUser.bind(controller));
router.put('/update-password', controller.onUpdatePassword.bind(controller));
router.post('/forgot-password', controller.onForgotPassword.bind(controller));
router.post('/verify-email', controller.onVerifyEmail.bind(controller));
router.post('/reset-password', controller.onResetPassword.bind(controller));

export default router;
