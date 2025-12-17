import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateQuery } from '../middlewares/validate.middleware';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentsQuerySchema,
} from '../validators/comment.validator';

const router = Router();

router.post(
  '/post/:postId',
  authenticate,
  validate(createCommentSchema),
  CommentController.createComment
);

router.get(
  '/post/:postId',
  authenticate,
  validateQuery(getCommentsQuerySchema),
  CommentController.getPostComments
);

router.get('/:id', CommentController.getComment);

router.get(
  '/:id/replies',
  validateQuery(getCommentsQuerySchema),
  CommentController.getCommentReplies
);

router.put('/:id', authenticate, validate(updateCommentSchema), CommentController.updateComment);

router.delete('/:id', authenticate, CommentController.deleteComment);

router.post('/:id/like', authenticate, CommentController.likeComment);

router.delete('/:id/like', authenticate, CommentController.unlikeComment);

export default router;
