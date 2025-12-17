/// <reference path="./types/express.d.ts" />
/// <reference path="./types/xss-clean.d.ts" />

import { createServer } from 'http';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { initializeSocket } from './config/socket';
import app from './app';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.io
    initializeSocket(httpServer);

    // Start server
    const PORT = env.PORT || 5000;
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      logger.info('Socket.io server initialized');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
