import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validate.middleware';
import { getNotificationsQuerySchema } from '../validators/notification.validator';

const router = Router();

router.get(
  '/',
  authenticate,
  validateQuery(getNotificationsQuerySchema),
  NotificationController.getNotifications
);

router.get('/unread-count', authenticate, NotificationController.getUnreadCount);

router.put('/:id/read', authenticate, NotificationController.markAsRead);

router.put('/read-all', authenticate, NotificationController.markAllAsRead);

router.delete('/:id', authenticate, NotificationController.deleteNotification);

export default router;
