import { Request, Response } from 'express';
import { ExploreService } from '../services/explore.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class ExploreController {
  static getExplorePosts = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const result = await ExploreService.getPopularPosts(
      Number(page) || 1,
      Number(limit) || 30
    );

    new ApiResponse(200, {
      data: result.posts,
      total: result.total,
      page: Number(page) || 1,
      pages: result.pages,
    }, 'Explore posts retrieved successfully').send(res);
  });

  static getTrendingPosts = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const result = await ExploreService.getTrendingPosts(
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Trending posts retrieved successfully').send(res);
  });

  static getPopularPosts = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const result = await ExploreService.getPopularPosts(
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Popular posts retrieved successfully').send(res);
  });

  static getRecentPosts = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query;

    const result = await ExploreService.getRecentPosts(
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Recent posts retrieved successfully').send(res);
  });
}
