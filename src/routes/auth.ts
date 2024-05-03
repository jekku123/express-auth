import express from 'express';
import container from '../config/container';
import { INTERFACE_TYPE } from '../config/dependencies';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();

const controller = container.get<AuthController>(INTERFACE_TYPE.AuthController);

router.post('/login', controller.onLogin.bind(controller));
router.get('/refresh', controller.onRefreshToken.bind(controller));
router.post('/verify-email', controller.onVerifyEmail.bind(controller));
router.post('/reset-password', controller.onResetPassword.bind(controller));

router.get('/test', controller.onTest.bind(controller));

router.get('/logout', controller.onLogout.bind(controller));

export default router;
