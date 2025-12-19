import { Notification, INotification, NotificationType } from '../models/Notification.model';
import { NotFoundError } from '../utils/ApiError';
import { emitToUser } from '../config/socket';
import mongoose from 'mongoose';

interface CreateNotificationData {
  recipient: string;
  sender: string;
  type: NotificationType;
  post?: string;
  comment?: string;
}

interface PopulatedSender {
  _id: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
}

interface PopulatedPost {
  _id: mongoose.Types.ObjectId;
  images: string[];
}

interface PopulatedNotification {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  sender: PopulatedSender;
  type: NotificationType;
  post?: PopulatedPost;
  comment?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData): Promise<INotification> {
    if (data.recipient === data.sender) {
      return null as any;
    }

    const notification = await Notification.create(data);
    const populatedNotification = await notification.populate('sender', 'username avatar');

    emitToUser(data.recipient, 'notification:new', {
      _id: populatedNotification._id,
      sender: {
        _id: (populatedNotification.sender as any)._id,
        username: (populatedNotification.sender as any).username,
        avatar: (populatedNotification.sender as any).avatar,
      },
      type: populatedNotification.type,
      post: populatedNotification.post,
      comment: populatedNotification.comment,
      isRead: populatedNotification.isRead,
      createdAt: populatedNotification.createdAt,
    });

    return notification;
  }

  static async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: PopulatedNotification[];
    total: number;
    pages: number;
    unreadCount: number;
  }> {
    const skip = (page - 1) * limit;

    const rawNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('post', 'images')
      .lean();

    const notifications: PopulatedNotification[] = rawNotifications.map((notif) => ({
      _id: notif._id,
      recipient: notif.recipient,
      sender: {
        _id: (notif.sender as any)._id,
        username: (notif.sender as any).username,
        avatar: (notif.sender as any).avatar,
      },
      type: notif.type,
      post: notif.post ? {
        _id: (notif.post as any)._id,
        images: (notif.post as any).images,
      } : undefined,
      comment: notif.comment,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
      updatedAt: notif.updatedAt,
    }));

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    const pages = Math.ceil(total / limit);

    return { notifications, total, pages, unreadCount };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    notification.isRead = true;
    await notification.save();

    return notification;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    return count;
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    await Notification.findByIdAndDelete(notificationId);
  }

  static async deleteNotificationByAction(data: {
    recipient: string;
    sender: string;
    type: NotificationType;
    post?: string;
    comment?: string;
  }): Promise<void> {
    const query: any = {
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
    };
    
    if (data.post) {
      query.post = data.post;
    }
    if (data.comment) {
      query.comment = data.comment;
    }

    const notification = await Notification.findOneAndDelete(query);
    
    if (notification) {
      emitToUser(data.recipient, 'notification:delete', {
        notificationId: notification._id.toString(),
      });
    }
  }
}
