import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimiter';
import { loginSchema, registerSchema, changePasswordSchema } from './auth.schema';
import * as authController from './auth.controller';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema, 'body'), authController.loginHandler);
router.post('/register', authLimiter, requireAuth, validate(registerSchema, 'body'), authController.registerHandler);
router.post('/refresh', authController.refreshHandler);
router.get('/me', requireAuth, authController.getMeHandler);
router.post('/change-password', requireAuth, validate(changePasswordSchema, 'body'), authController.changePasswordHandler);
router.post('/logout', authController.logoutHandler);

export default router;
