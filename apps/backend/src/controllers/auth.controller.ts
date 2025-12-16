import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const { username, email, password, fullName } = req.body;

    const result = await AuthService.register({
      username,
      email,
      password,
      fullName,
    });

    new ApiResponse(201, result, 'User registered successfully').send(res);
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

    new ApiResponse(200, result, 'Login successful').send(res);
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshToken(refreshToken);

    new ApiResponse(200, result, 'Token refreshed successfully').send(res);
  });

  static logout = catchAsync(async (req: Request, res: Response) => {
    new ApiResponse(200, null, 'Logout successful').send(res);
  });

  static getCurrentUser = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!;

    new ApiResponse(200, { user }, 'User retrieved successfully').send(res);
  });
}
