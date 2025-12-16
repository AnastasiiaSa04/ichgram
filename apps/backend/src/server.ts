import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import app from './app';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const PORT = env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
