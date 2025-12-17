import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';

export class MessageController {
  static sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { recipient, content } = req.body;
    const senderId = req.user!._id.toString();

    const message = await MessageService.sendMessage({
      sender: senderId,
      recipient,
      content,
    });

    new ApiResponse(201, { message }, 'Message sent successfully').send(res);
  });

  static getConversations = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const { page, limit } = req.query;

    const result = await MessageService.getConversations(
      userId,
      Number(page) || 1,
      Number(limit) || 20
    );

    new ApiResponse(200, result, 'Conversations retrieved successfully').send(res);
  });

  static getMessages = catchAsync(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user!._id.toString();
    const { page, limit } = req.query;

    const result = await MessageService.getMessages(
      conversationId,
      userId,
      Number(page) || 1,
      Number(limit) || 50
    );

    new ApiResponse(200, result, 'Messages retrieved successfully').send(res);
  });

  static markMessagesAsRead = catchAsync(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user!._id.toString();

    await MessageService.markMessagesAsRead(conversationId, userId);

    new ApiResponse(200, null, 'Messages marked as read').send(res);
  });

  static getUnreadCount = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    const count = await MessageService.getUnreadCount(userId);

    new ApiResponse(200, { count }, 'Unread count retrieved successfully').send(res);
  });

  static deleteConversation = catchAsync(async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const userId = req.user!._id.toString();

    await MessageService.deleteConversation(conversationId, userId);

    new ApiResponse(200, null, 'Conversation deleted successfully').send(res);
  });
}
