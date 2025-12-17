import { Router } from 'express';
import { ExploreController } from '../controllers/explore.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { exploreQuerySchema } from '../validators/search.validator';

const router = Router();

router.get('/trending', validateQuery(exploreQuerySchema), ExploreController.getTrendingPosts);

router.get('/popular', validateQuery(exploreQuerySchema), ExploreController.getPopularPosts);

router.get('/recent', validateQuery(exploreQuerySchema), ExploreController.getRecentPosts);

export default router;
