import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateQuery } from '../middlewares/validate.middleware';
import { createPostSchema, updatePostSchema, getPostsQuerySchema } from '../validators/post.validator';
import { uploadImage } from '../middlewares/upload.middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  uploadImage.array('images', 10),
  validate(createPostSchema),
  PostController.createPost
);

router.get('/feed', authenticate, validateQuery(getPostsQuerySchema), PostController.getFeed);

router.get('/user/:userId', validateQuery(getPostsQuerySchema), PostController.getUserPosts);

router.get('/:id', PostController.getPost);

router.put('/:id', authenticate, validate(updatePostSchema), PostController.updatePost);

router.delete('/:id', authenticate, PostController.deletePost);

export default router;
