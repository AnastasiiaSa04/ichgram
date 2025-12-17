import { NotificationService } from '../../../services/notification.service';
import { Notification, NotificationType } from '../../../models/Notification.model';
import { NotFoundError } from '../../../utils/ApiError';
import mongoose from 'mongoose';

jest.mock('../../../models/Notification.model');

describe('NotificationService', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockSenderId = new mongoose.Types.ObjectId().toString();
  const mockPostId = new mongoose.Types.ObjectId().toString();
  const mockCommentId = new mongoose.Types.ObjectId().toString();
  const mockNotificationId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const notificationData = {
        recipient: mockUserId,
        sender: mockSenderId,
        type: NotificationType.FOLLOW,
      };

      const mockNotification = {
        _id: new mongoose.Types.ObjectId(),
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification(notificationData);

      expect(Notification.create).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(mockNotification);
    });

    it('should not create notification when recipient and sender are the same', async () => {
      const notificationData = {
        recipient: mockUserId,
        sender: mockUserId,
        type: NotificationType.LIKE,
        post: mockPostId,
      };

      const result = await NotificationService.createNotification(notificationData);

      expect(Notification.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should create notification with post reference', async () => {
      const notificationData = {
        recipient: mockUserId,
        sender: mockSenderId,
        type: NotificationType.LIKE,
        post: mockPostId,
      };

      const mockNotification = {
        _id: new mongoose.Types.ObjectId(),
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification(notificationData);

      expect(Notification.create).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(mockNotification);
    });

    it('should create notification with comment reference', async () => {
      const notificationData = {
        recipient: mockUserId,
        sender: mockSenderId,
        type: NotificationType.COMMENT,
        post: mockPostId,
        comment: mockCommentId,
      };

      const mockNotification = {
        _id: new mongoose.Types.ObjectId(),
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (Notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.createNotification(notificationData);

      expect(Notification.create).toHaveBeenCalledWith(notificationData);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getNotifications', () => {
    it('should get notifications with pagination', async () => {
      const mockNotifications = [
        {
          _id: new mongoose.Types.ObjectId(),
          recipient: new mongoose.Types.ObjectId(mockUserId),
          sender: {
            _id: new mongoose.Types.ObjectId(mockSenderId),
            username: 'sender',
            avatar: 'avatar.jpg',
          },
          type: NotificationType.FOLLOW,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockNotifications),
      };

      (Notification.find as jest.Mock).mockReturnValue(mockQuery);
      (Notification.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await NotificationService.getNotifications(mockUserId, 1, 20);

      expect(Notification.find).toHaveBeenCalledWith({ recipient: mockUserId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
    });

    it('should calculate correct pagination values', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (Notification.find as jest.Mock).mockReturnValue(mockQuery);
      (Notification.countDocuments as jest.Mock).mockResolvedValue(45);

      const result = await NotificationService.getNotifications(mockUserId, 2, 20);

      expect(mockQuery.skip).toHaveBeenCalledWith(20);
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(result.total).toBe(45);
      expect(result.pages).toBe(3);
    });

    it('should include unread count in response', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };

      (Notification.find as jest.Mock).mockReturnValue(mockQuery);
      (Notification.countDocuments as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      const result = await NotificationService.getNotifications(mockUserId, 1, 20);

      expect(Notification.countDocuments).toHaveBeenCalledWith({ recipient: mockUserId });
      expect(Notification.countDocuments).toHaveBeenCalledWith({
        recipient: mockUserId,
        isRead: false,
      });
      expect(result.unreadCount).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const mockNotification = {
        _id: new mongoose.Types.ObjectId(mockNotificationId),
        recipient: new mongoose.Types.ObjectId(mockUserId),
        sender: new mongoose.Types.ObjectId(mockSenderId),
        type: NotificationType.FOLLOW,
        isRead: false,
        save: jest.fn().mockResolvedValue(true),
      };

      (Notification.findOne as jest.Mock).mockResolvedValue(mockNotification);

      const result = await NotificationService.markAsRead(mockNotificationId, mockUserId);

      expect(Notification.findOne).toHaveBeenCalledWith({
        _id: mockNotificationId,
        recipient: mockUserId,
      });
      expect(mockNotification.save).toHaveBeenCalled();
      expect(mockNotification.isRead).toBe(true);
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundError when notification does not exist', async () => {
      (Notification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        NotificationService.markAsRead(mockNotificationId, mockUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when user is not the recipient', async () => {
      (Notification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        NotificationService.markAsRead(mockNotificationId, mockUserId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      (Notification.updateMany as jest.Mock).mockResolvedValue({
        modifiedCount: 5,
      });

      await NotificationService.markAllAsRead(mockUserId);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { recipient: mockUserId, isRead: false },
        { isRead: true }
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for a user', async () => {
      (Notification.countDocuments as jest.Mock).mockResolvedValue(7);

      const result = await NotificationService.getUnreadCount(mockUserId);

      expect(Notification.countDocuments).toHaveBeenCalledWith({
        recipient: mockUserId,
        isRead: false,
      });
      expect(result).toBe(7);
    });

    it('should return 0 when no unread notifications', async () => {
      (Notification.countDocuments as jest.Mock).mockResolvedValue(0);

      const result = await NotificationService.getUnreadCount(mockUserId);

      expect(result).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const mockNotification = {
        _id: new mongoose.Types.ObjectId(mockNotificationId),
        recipient: new mongoose.Types.ObjectId(mockUserId),
        sender: new mongoose.Types.ObjectId(mockSenderId),
        type: NotificationType.FOLLOW,
        isRead: false,
      };

      (Notification.findOne as jest.Mock).mockResolvedValue(mockNotification);
      (Notification.findByIdAndDelete as jest.Mock).mockResolvedValue(mockNotification);

      await NotificationService.deleteNotification(mockNotificationId, mockUserId);

      expect(Notification.findOne).toHaveBeenCalledWith({
        _id: mockNotificationId,
        recipient: mockUserId,
      });
      expect(Notification.findByIdAndDelete).toHaveBeenCalledWith(mockNotificationId);
    });

    it('should throw NotFoundError when notification does not exist', async () => {
      (Notification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        NotificationService.deleteNotification(mockNotificationId, mockUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when user is not the recipient', async () => {
      (Notification.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        NotificationService.deleteNotification(mockNotificationId, mockUserId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
