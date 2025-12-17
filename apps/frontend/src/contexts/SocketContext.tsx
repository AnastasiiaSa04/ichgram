import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { WS_URL } from '@/lib/constants';
import { postsApi } from '@/features/posts/postsApi';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { accessToken, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleUserOnline = useCallback((userId: string) => {
    setOnlineUsers((prev) => new Set(prev).add(userId));
  }, []);

  const handleUserOffline = useCallback((userId: string) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    const socketUrl = WS_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('user:online', handleUserOnline);
    newSocket.on('user:offline', handleUserOffline);

    newSocket.on('post:like', (data: { postId: string; userId: string; likesCount: number }) => {
      dispatch(
        postsApi.util.invalidateTags([{ type: 'Post', id: data.postId }])
      );
    });

    newSocket.on('post:unlike', (data: { postId: string; userId: string; likesCount: number }) => {
      dispatch(
        postsApi.util.invalidateTags([{ type: 'Post', id: data.postId }])
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('user:online', handleUserOnline);
      newSocket.off('user:offline', handleUserOffline);
      newSocket.off('post:like');
      newSocket.off('post:unlike');
      newSocket.disconnect();
    };
  }, [isAuthenticated, accessToken, handleUserOnline, handleUserOffline, dispatch, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

