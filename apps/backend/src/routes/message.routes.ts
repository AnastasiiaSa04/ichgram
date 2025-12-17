import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate, validateQuery } from '../middlewares/validate.middleware';
import {
  sendMessageSchema,
  getConversationsQuerySchema,
  getMessagesQuerySchema,
} from '../validators/message.validator';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(sendMessageSchema),
  MessageController.sendMessage
);

router.get(
  '/conversations',
  authenticate,
  validateQuery(getConversationsQuerySchema),
  MessageController.getConversations
);

router.get('/unread-count', authenticate, MessageController.getUnreadCount);

router.get(
  '/conversations/:conversationId',
  authenticate,
  validateQuery(getMessagesQuerySchema),
  MessageController.getMessages
);

router.put(
  '/conversations/:conversationId/read',
  authenticate,
  MessageController.markMessagesAsRead
);

router.delete(
  '/conversations/:conversationId',
  authenticate,
  MessageController.deleteConversation
);

export default router;
