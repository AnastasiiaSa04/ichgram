import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { CommentLikeService } from '../services/commentLike.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class CommentController {
  static createComment = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = req.user!._id.toString();
    const { content, parentComment } = req.body;

    const comment = await CommentService.createComment({
      post: postId,
      author: userId,
      content,
      parentComment,
    });

    new ApiResponse(201, { comment }, 'Comment created successfully').send(res);
  });

  static getComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const comment = await CommentService.getCommentById(id);

    new ApiResponse(200, { comment }, 'Comment retrieved successfully').send(res);
  });

  static getPostComments = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { page, limit } = req.query;
    const currentUserId = req.user?._id.toString();

    const result = await CommentService.getPostComments(
      postId,
      Number(page) || 1,
      Number(limit) || 20,
      currentUserId
    );

    new ApiResponse(200, result, 'Post comments retrieved successfully').send(res);
  });

  static getCommentReplies = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page, limit } = req.query;

    const result = await CommentService.getCommentReplies(
      id,
      Number(page) || 1,
      Number(limit) || 10
    );

    new ApiResponse(200, result, 'Comment replies retrieved successfully').send(res);
  });

  static updateComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const { content } = req.body;

    const comment = await CommentService.updateComment(id, userId, { content });

    new ApiResponse(200, { comment }, 'Comment updated successfully').send(res);
  });

  static deleteComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    await CommentService.deleteComment(id, userId);

    new ApiResponse(200, null, 'Comment deleted successfully').send(res);
  });

  static likeComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    await CommentLikeService.likeComment(id, userId);

    new ApiResponse(201, null, 'Comment liked successfully').send(res);
  });

  static unlikeComment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    await CommentLikeService.unlikeComment(id, userId);

    new ApiResponse(200, null, 'Comment unliked successfully').send(res);
  });
}
