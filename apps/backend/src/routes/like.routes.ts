import { Router } from 'express';
import { LikeController } from '../controllers/like.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/:postId', authenticate, LikeController.likePost);

router.delete('/:postId', authenticate, LikeController.unlikePost);

router.get('/:postId', LikeController.getPostLikes);

export default router;
