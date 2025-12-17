import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();

  const healthData = {
    status: 'OK',
    timestamp,
    uptime: `${Math.floor(uptime)}s`,
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(ApiResponse.success(healthData, 'Health check successful'));
});

export default router;
