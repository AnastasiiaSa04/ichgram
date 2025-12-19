import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { WS_URL } from '@/lib/constants';
import { postsApi } from '@/features/posts/postsApi';
import { messagesApi } from '@/features/messages/messagesApi';
import { notificationsApi } from '@/features/notifications/notificationsApi';
import { commentsApi } from '@/features/posts/commentsApi';

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
      dispatch(postsApi.util.invalidateTags([{ type: 'Post', id: data.postId }]));
    });

    newSocket.on('post:unlike', (data: { postId: string; userId: string; likesCount: number }) => {
      dispatch(postsApi.util.invalidateTags([{ type: 'Post', id: data.postId }]));
    });

    newSocket.on('message:new', (data: { conversationId: string; message: any }) => {
      dispatch(
        messagesApi.util.invalidateTags([
          { type: 'Message', id: `CONV_${data.conversationId}` },
          { type: 'Conversation', id: 'LIST' },
        ])
      );
    });

    newSocket.on('message:read', (data: { conversationId: string; readBy: string }) => {
      dispatch(
        messagesApi.util.invalidateTags([{ type: 'Message', id: `CONV_${data.conversationId}` }])
      );
    });

    newSocket.on('notification:new', (_data: any) => {
      dispatch(
        notificationsApi.util.invalidateTags([
          { type: 'Notification', id: 'LIST' },
          { type: 'Notification', id: 'UNREAD_COUNT' },
        ])
      );
    });

    newSocket.on('comment:new', (data: { postId: string; comment: any }) => {
      dispatch(
        commentsApi.util.invalidateTags([
          { type: 'Comment', id: `POST_${data.postId}` },
          { type: 'Post', id: data.postId },
        ])
      );
    });

    newSocket.on('comment:update', (data: { commentId: string; postId: string }) => {
      dispatch(
        commentsApi.util.invalidateTags([
          { type: 'Comment', id: data.commentId },
          { type: 'Comment', id: `POST_${data.postId}` },
        ])
      );
    });

    newSocket.on('comment:delete', (data: { commentId: string; postId: string }) => {
      dispatch(
        commentsApi.util.invalidateTags([
          { type: 'Comment', id: data.commentId },
          { type: 'Comment', id: `POST_${data.postId}` },
          { type: 'Post', id: data.postId },
        ])
      );
    });

    newSocket.on(
      'comment:like',
      (data: { commentId: string; postId: string; userId: string; likesCount: number }) => {
        dispatch(
          commentsApi.util.invalidateTags([
            { type: 'Comment', id: data.commentId },
            { type: 'Comment', id: `POST_${data.postId}` },
          ])
        );
      }
    );

    newSocket.on(
      'comment:unlike',
      (data: { commentId: string; postId: string; userId: string; likesCount: number }) => {
        dispatch(
          commentsApi.util.invalidateTags([
            { type: 'Comment', id: data.commentId },
            { type: 'Comment', id: `POST_${data.postId}` },
          ])
        );
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.off('user:online', handleUserOnline);
      newSocket.off('user:offline', handleUserOffline);
      newSocket.off('post:like');
      newSocket.off('post:unlike');
      newSocket.off('message:new');
      newSocket.off('message:read');
      newSocket.off('notification:new');
      newSocket.off('comment:new');
      newSocket.off('comment:update');
      newSocket.off('comment:delete');
      newSocket.off('comment:like');
      newSocket.off('comment:unlike');
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
