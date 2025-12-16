import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { FileService } from '../services/file.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { ValidationError } from '../utils/ApiError';

export class UserController {
  static getProfile = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user?._id.toString();

    const userProfile = await UserService.getUserProfile(id, currentUserId);

    new ApiResponse(200, { user: userProfile }, 'User profile retrieved successfully').send(res);
  });

  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const { fullName, bio } = req.body;

    const user = await UserService.updateProfile(userId, { fullName, bio });

    new ApiResponse(200, { user }, 'Profile updated successfully').send(res);
  });

  static uploadAvatar = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const avatarUrl = await FileService.uploadFile(req.file);
    const user = await UserService.updateAvatar(userId, avatarUrl);

    new ApiResponse(200, { user }, 'Avatar uploaded successfully').send(res);
  });

  static searchUsers = catchAsync(async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    const users = await UserService.searchUsers(q as string, Number(limit) || 10);

    new ApiResponse(200, { users }, 'Users retrieved successfully').send(res);
  });

  static getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    new ApiResponse(200, { user }, 'Current user retrieved successfully').send(res);
  });
}
