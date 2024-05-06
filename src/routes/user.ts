import express from 'express';
import { INTERFACE_TYPE } from '../container/dependencies';
import { UserController } from '../controllers/user.controller';

import container from '../container';
import { sessionValidator } from '../middlewares/sessionValidator';

const router = express.Router();

const controller = container.get<UserController>(INTERFACE_TYPE.UserController);

router.post('/register', controller.onRegister.bind(controller));
router.get('/verify-email', controller.onVerifyEmail.bind(controller));
router.put('/update-password', controller.onUpdatePassword.bind(controller));
router.post('/reset-password', controller.onResetPassword.bind(controller));
router.post('/forgot-password', controller.onForgotPassword.bind(controller));

router.use(sessionValidator);

router.get('/', controller.onGetUser.bind(controller));

export default router;
