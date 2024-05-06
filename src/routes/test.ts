import express from 'express';
import container from '../container';
import { INTERFACE_TYPE } from '../container/dependencies';
import { TestController } from '../controllers/test.controller';

const router = express.Router();

const controller = container.get<TestController>(INTERFACE_TYPE.TestController);

router.get('/', controller.onTest.bind(controller));

export default router;
