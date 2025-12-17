import { Request, Response } from 'express';
import { FollowService } from '../services/follow.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class FollowController {
  static followUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const followerId = req.user!._id.toString();

    const follow = await FollowService.followUser(followerId, userId);

    new ApiResponse(201, { follow }, 'User followed successfully').send(res);
  });

  static unfollowUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const followerId = req.user!._id.toString();

    await FollowService.unfollowUser(followerId, userId);

    new ApiResponse(200, null, 'User unfollowed successfully').send(res);
  });

  static getFollowers = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await FollowService.getFollowers(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Followers retrieved successfully').send(res);
  });

  static getFollowing = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await FollowService.getFollowing(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Following retrieved successfully').send(res);
  });
}
