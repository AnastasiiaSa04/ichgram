import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { AuthenticationError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';

export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Access token is required');
  }

  const token = authHeader.substring(7);

  const payload = TokenService.verifyAccessToken(token);

  const user = await AuthService.getUserById(payload.userId);

  req.user = user;

  next();
});
