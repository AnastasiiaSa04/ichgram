import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);

router.post('/login', validate(loginSchema), AuthController.login);

router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);

router.post('/logout', authenticate, AuthController.logout);

router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
