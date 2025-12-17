import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import path from 'path';
import { httpLogger } from './config/logger';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';
import healthRoutes from './routes/health.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization middleware
app.use(mongoSanitize());
app.use(xss());

// HTTP logging
app.use(httpLogger);

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(env.UPLOAD_PATH)));

// Health check endpoint
app.use('/health', healthRoutes);

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
