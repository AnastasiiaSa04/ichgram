import { Request, Response } from 'express';
import { LikeService } from '../services/like.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class LikeController {
  static likePost = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = req.user!._id.toString();

    const like = await LikeService.likePost(postId, userId);

    new ApiResponse(201, { like }, 'Post liked successfully').send(res);
  });

  static unlikePost = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const userId = req.user!._id.toString();

    await LikeService.unlikePost(postId, userId);

    new ApiResponse(200, null, 'Post unliked successfully').send(res);
  });

  static getPostLikes = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { page, limit } = req.query;

    const result = await LikeService.getPostLikes(
      postId,
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Post likes retrieved successfully').send(res);
  });
}
