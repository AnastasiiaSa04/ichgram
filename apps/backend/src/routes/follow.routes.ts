import { Router } from 'express';
import { FollowController } from '../controllers/follow.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validate.middleware';
import { getFollowsQuerySchema } from '../validators/follow.validator';

const router = Router();

router.post('/:userId', authenticate, FollowController.followUser);

router.delete('/:userId', authenticate, FollowController.unfollowUser);

router.get('/:userId/followers', authenticate, validateQuery(getFollowsQuerySchema), FollowController.getFollowers);

router.get('/:userId/following', authenticate, validateQuery(getFollowsQuerySchema), FollowController.getFollowing);

export default router;
