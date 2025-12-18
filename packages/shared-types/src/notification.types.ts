import { UserBasic } from './user.types';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  COMMENT_REPLY = 'comment_reply',
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: string | UserBasic;
  type: NotificationType;
  post?: string;
  comment?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationWithSender extends Omit<Notification, 'sender'> {
  sender: UserBasic;
}
