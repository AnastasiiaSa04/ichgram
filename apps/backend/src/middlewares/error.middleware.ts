import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const { statusCode, message } = error as ApiError;

  // Log error
  logger.error({
    statusCode,
    message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Send response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.method} ${req.url} not found`);
  next(error);
};
