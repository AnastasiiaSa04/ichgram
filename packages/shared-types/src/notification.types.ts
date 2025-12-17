import { UserBasic } from './user.types';

export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
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
