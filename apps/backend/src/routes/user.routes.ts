import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateQuery } from '../middlewares/validate.middleware';
import { updateProfileSchema, searchUsersSchema } from '../validators/user.validator';
import { uploadImage } from '../middlewares/upload.middleware';

const router = Router();

router.get('/me', authenticate, UserController.getCurrentUser);

router.get('/search', validateQuery(searchUsersSchema), UserController.searchUsers);

router.get('/:id', authenticate, UserController.getProfile);

router.put('/profile', authenticate, validate(updateProfileSchema), UserController.updateProfile);

router.post('/avatar', authenticate, uploadImage.single('avatar'), UserController.uploadAvatar);

export default router;
