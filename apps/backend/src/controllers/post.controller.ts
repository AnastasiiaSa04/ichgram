import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import { FileService } from '../services/file.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { ValidationError } from '../utils/ApiError';

export class PostController {
  static createPost = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const { caption, location } = req.body;

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new ValidationError('At least one image is required');
    }

    const imageUrls = await Promise.all(
      req.files.map((file: Express.Multer.File) => FileService.uploadFile(file))
    );

    const post = await PostService.createPost({
      author: userId,
      images: imageUrls,
      caption,
      location,
    });

    new ApiResponse(201, { post }, 'Post created successfully').send(res);
  });

  static getPost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user?._id.toString();

    const post = await PostService.getPostById(id, currentUserId);

    new ApiResponse(200, { post }, 'Post retrieved successfully').send(res);
  });

  static getUserPosts = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await PostService.getUserPosts(
      userId,
      Number(page) || 1,
      Number(limit) || 10
    );

    new ApiResponse(200, result, 'User posts retrieved successfully').send(res);
  });

  static getFeed = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const { page, limit } = req.query;

    const result = await PostService.getFeedPosts(
      userId,
      Number(page) || 1,
      Number(limit) || 10
    );

    new ApiResponse(200, result, 'Feed posts retrieved successfully').send(res);
  });

  static updatePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();
    const { caption, location } = req.body;

    const post = await PostService.updatePost(id, userId, { caption, location });

    new ApiResponse(200, { post }, 'Post updated successfully').send(res);
  });

  static deletePost = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    await PostService.deletePost(id, userId);

    new ApiResponse(200, null, 'Post deleted successfully').send(res);
  });
}
