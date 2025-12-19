import { UserBasic } from './user.types';

export enum NotificationType {
  LIKE = 'like',
  UNLIKE = 'unlike',
  COMMENT = 'comment',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_LIKE = 'comment_like',
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
}

export interface NotificationPost {
  _id: string;
  images: string[];
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: string | UserBasic;
  type: NotificationType;
  post?: string | NotificationPost;
  comment?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationWithSender extends Omit<Notification, 'sender' | 'post'> {
  sender: UserBasic;
  post?: NotificationPost;
}
