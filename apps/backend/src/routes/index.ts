import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import likeRoutes from './like.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/likes', likeRoutes);

export default router;
