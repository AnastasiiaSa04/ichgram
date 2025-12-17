import { Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class SearchController {
  static searchPosts = catchAsync(async (req: Request, res: Response) => {
    const { q, page, limit } = req.query;

    const result = await SearchService.searchPosts(
      q as string,
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Posts search results').send(res);
  });

  static globalSearch = catchAsync(async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    const result = await SearchService.globalSearch(q as string, Number(limit) || 5);

    new ApiResponse(200, result, 'Global search results').send(res);
  });
}
