import { MessageWithSender } from './message.types';
import { NotificationWithSender } from './notification.types';

export interface SocketEvents {
  // Message events
  'message:new': (data: {
    conversationId: string;
    message: MessageWithSender;
  }) => void;

  'message:read': (data: {
    conversationId: string;
    readBy: string;
  }) => void;

  'message:typing': (data: {
    conversationId: string;
    userId: string;
  }) => void;

  'message:stop_typing': (data: {
    conversationId: string;
    userId: string;
  }) => void;

  // Notification events
  'notification:new': (notification: NotificationWithSender) => void;
  'notification:delete': (data: { notificationId: string }) => void;

  // User events
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
}
