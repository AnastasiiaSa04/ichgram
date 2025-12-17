import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { TokenService } from '../services/token.service';
import { logger } from './logger';
import { env } from './env';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

import { Socket } from 'socket.io';

export let io: SocketIOServer;

const connectedUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = TokenService.verifyAccessToken(token);
      socket.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    connectedUsers.set(userId, socket.id);
    logger.info(`User connected: ${userId}`);

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      logger.info(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getSocketId = (userId: string): string | undefined => {
  return connectedUsers.get(userId);
};

export const emitToUser = (userId: string, event: string, data: any): void => {
  const socketId = getSocketId(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};
