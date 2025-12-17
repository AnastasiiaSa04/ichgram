import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import likeRoutes from './like.routes';
import commentRoutes from './comment.routes';
import searchRoutes from './search.routes';
import exploreRoutes from './explore.routes';
import followRoutes from './follow.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/likes', likeRoutes);
router.use('/comments', commentRoutes);
router.use('/search', searchRoutes);
router.use('/explore', exploreRoutes);
router.use('/follows', followRoutes);
router.use('/notifications', notificationRoutes);

export default router;
