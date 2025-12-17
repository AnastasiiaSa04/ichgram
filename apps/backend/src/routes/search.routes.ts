import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { validateQuery } from '../middlewares/validate.middleware';
import { searchPostsSchema, globalSearchSchema } from '../validators/search.validator';

const router = Router();

router.get('/posts', validateQuery(searchPostsSchema), SearchController.searchPosts);

router.get('/global', validateQuery(globalSearchSchema), SearchController.globalSearch);

export default router;
