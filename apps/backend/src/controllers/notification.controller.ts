import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class NotificationController {
  static getNotifications = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const { page, limit } = req.query;

    const result = await NotificationService.getNotifications(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Notifications retrieved successfully').send(res);
  });

  static markAsRead = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    const notification = await NotificationService.markAsRead(id, userId);

    new ApiResponse(200, { notification }, 'Notification marked as read').send(res);
  });

  static markAllAsRead = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    await NotificationService.markAllAsRead(userId);

    new ApiResponse(200, null, 'All notifications marked as read').send(res);
  });

  static getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    const count = await NotificationService.getUnreadCount(userId);

    new ApiResponse(200, { count }, 'Unread count retrieved successfully').send(res);
  });

  static deleteNotification = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!._id.toString();

    await NotificationService.deleteNotification(id, userId);

    new ApiResponse(200, null, 'Notification deleted successfully').send(res);
  });
}
