import { MessageService } from '../../../services/message.service';
import { Message } from '../../../models/Message.model';
import { Conversation } from '../../../models/Conversation.model';
import { User } from '../../../models/User.model';
import { NotFoundError, ForbiddenError } from '../../../utils/ApiError';
import * as socketModule from '../../../config/socket';
import mongoose from 'mongoose';

jest.mock('../../../models/Message.model');
jest.mock('../../../models/Conversation.model');
jest.mock('../../../models/User.model');
jest.mock('../../../config/socket');

describe('MessageService', () => {
  const mockUserId1 = new mongoose.Types.ObjectId().toString();
  const mockUserId2 = new mongoose.Types.ObjectId().toString();
  const mockConversationId = new mongoose.Types.ObjectId().toString();
  const mockMessageId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should create a new conversation and send message', async () => {
      const messageData = {
        sender: mockUserId1,
        recipient: mockUserId2,
        content: 'Hello!',
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(mockUserId2),
        username: 'recipient',
      };

      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [mockUserId1, mockUserId2],
      };

      const mockMessage = {
        _id: new mongoose.Types.ObjectId(mockMessageId),
        conversation: mockConversationId,
        sender: mockUserId1,
        content: 'Hello!',
        isRead: false,
        createdAt: new Date(),
        populate: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(mockMessageId),
          conversation: mockConversationId,
          sender: {
            _id: new mongoose.Types.ObjectId(mockUserId1),
            username: 'sender',
            avatar: 'avatar.jpg',
          },
          content: 'Hello!',
          isRead: false,
          createdAt: new Date(),
        }),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Conversation.findOne as jest.Mock).mockResolvedValue(null);
      (Conversation.create as jest.Mock).mockResolvedValue(mockConversation);
      (Message.create as jest.Mock).mockResolvedValue(mockMessage);
      (Conversation.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockConversation);

      const result = await MessageService.sendMessage(messageData);

      expect(User.findById).toHaveBeenCalledWith(mockUserId2);
      expect(Conversation.findOne).toHaveBeenCalled();
      expect(Conversation.create).toHaveBeenCalled();
      expect(Message.create).toHaveBeenCalledWith({
        conversation: mockConversation._id,
        sender: mockUserId1,
        content: 'Hello!',
      });
      expect(socketModule.emitToUser).toHaveBeenCalledWith(
        mockUserId2,
        'message:new',
        expect.any(Object)
      );
    });

    it('should use existing conversation when sending message', async () => {
      const messageData = {
        sender: mockUserId1,
        recipient: mockUserId2,
        content: 'Hello again!',
      };

      const mockUser = {
        _id: new mongoose.Types.ObjectId(mockUserId2),
        username: 'recipient',
      };

      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [mockUserId1, mockUserId2],
      };

      const mockMessage = {
        _id: new mongoose.Types.ObjectId(mockMessageId),
        conversation: mockConversationId,
        sender: mockUserId1,
        content: 'Hello again!',
        isRead: false,
        createdAt: new Date(),
        populate: jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(mockMessageId),
          sender: {
            _id: new mongoose.Types.ObjectId(mockUserId1),
            username: 'sender',
          },
          content: 'Hello again!',
        }),
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (Conversation.findOne as jest.Mock).mockResolvedValue(mockConversation);
      (Message.create as jest.Mock).mockResolvedValue(mockMessage);
      (Conversation.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockConversation);

      await MessageService.sendMessage(messageData);

      expect(Conversation.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when recipient does not exist', async () => {
      const messageData = {
        sender: mockUserId1,
        recipient: mockUserId2,
        content: 'Hello!',
      };

      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(MessageService.sendMessage(messageData)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getConversations', () => {
    it('should get user conversations with pagination', async () => {
      const mockConversations = [
        {
          _id: new mongoose.Types.ObjectId(mockConversationId),
          participants: [
            {
              _id: new mongoose.Types.ObjectId(mockUserId1),
              username: 'user1',
            },
            {
              _id: new mongoose.Types.ObjectId(mockUserId2),
              username: 'user2',
            },
          ],
          lastMessage: {
            _id: new mongoose.Types.ObjectId(mockMessageId),
            sender: {
              _id: new mongoose.Types.ObjectId(mockUserId2),
              username: 'user2',
            },
            content: 'Last message',
            createdAt: new Date(),
          },
          lastMessageAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockConversations),
      };

      (Conversation.find as jest.Mock).mockReturnValue(mockQuery);
      (Conversation.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await MessageService.getConversations(mockUserId1, 1, 20);

      expect(Conversation.find).toHaveBeenCalledWith({ participants: mockUserId1 });
      expect(result.conversations).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
    });
  });

  describe('getMessages', () => {
    it('should get messages in a conversation', async () => {
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [
          new mongoose.Types.ObjectId(mockUserId1),
          new mongoose.Types.ObjectId(mockUserId2),
        ],
      };

      const mockMessages = [
        {
          _id: new mongoose.Types.ObjectId(mockMessageId),
          conversation: new mongoose.Types.ObjectId(mockConversationId),
          sender: {
            _id: new mongoose.Types.ObjectId(mockUserId1),
            username: 'user1',
          },
          content: 'Message 1',
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
        lean: jest.fn().mockResolvedValue(mockMessages),
      };

      (Conversation.findById as jest.Mock).mockResolvedValue(mockConversation);
      (Message.find as jest.Mock).mockReturnValue(mockQuery);
      (Message.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await MessageService.getMessages(mockConversationId, mockUserId1, 1, 50);

      expect(Conversation.findById).toHaveBeenCalledWith(mockConversationId);
      expect(result.messages).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should throw NotFoundError when conversation does not exist', async () => {
      (Conversation.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        MessageService.getMessages(mockConversationId, mockUserId1)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not a participant', async () => {
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [
          new mongoose.Types.ObjectId(mockUserId2),
          new mongoose.Types.ObjectId(new mongoose.Types.ObjectId().toString()),
        ],
      };

      (Conversation.findById as jest.Mock).mockResolvedValue(mockConversation);

      await expect(
        MessageService.getMessages(mockConversationId, mockUserId1)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read and emit event', async () => {
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [
          new mongoose.Types.ObjectId(mockUserId1),
          new mongoose.Types.ObjectId(mockUserId2),
        ],
      };

      (Conversation.findById as jest.Mock).mockResolvedValue(mockConversation);
      (Message.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 3 });

      await MessageService.markMessagesAsRead(mockConversationId, mockUserId1);

      expect(Message.updateMany).toHaveBeenCalled();
      expect(socketModule.emitToUser).toHaveBeenCalledWith(
        mockUserId2,
        'message:read',
        expect.any(Object)
      );
    });

    it('should not emit event when no messages were updated', async () => {
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [
          new mongoose.Types.ObjectId(mockUserId1),
          new mongoose.Types.ObjectId(mockUserId2),
        ],
      };

      (Conversation.findById as jest.Mock).mockResolvedValue(mockConversation);
      (Message.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

      await MessageService.markMessagesAsRead(mockConversationId, mockUserId1);

      expect(socketModule.emitToUser).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      const mockConversations = [
        { _id: new mongoose.Types.ObjectId() },
        { _id: new mongoose.Types.ObjectId() },
      ];

      (Conversation.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockConversations),
      });
      (Message.countDocuments as jest.Mock).mockResolvedValue(5);

      const result = await MessageService.getUnreadCount(mockUserId1);

      expect(result).toBe(5);
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation and all messages', async () => {
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [
          new mongoose.Types.ObjectId(mockUserId1),
          new mongoose.Types.ObjectId(mockUserId2),
        ],
      };

      (Conversation.findById as jest.Mock).mockResolvedValue(mockConversation);
      (Message.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });
      (Conversation.findByIdAndDelete as jest.Mock).mockResolvedValue(mockConversation);

      await MessageService.deleteConversation(mockConversationId, mockUserId1);

      expect(Message.deleteMany).toHaveBeenCalledWith({ conversation: mockConversationId });
      expect(Conversation.findByIdAndDelete).toHaveBeenCalledWith(mockConversationId);
    });

    it('should throw NotFoundError when conversation does not exist', async () => {
      (Conversation.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        MessageService.deleteConversation(mockConversationId, mockUserId1)
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when user is not a participant', async () => {
      const mockConversation = {
        _id: new mongoose.Types.ObjectId(mockConversationId),
        participants: [
          new mongoose.Types.ObjectId(mockUserId2),
          new mongoose.Types.ObjectId(new mongoose.Types.ObjectId().toString()),
        ],
      };

      (Conversation.findById as jest.Mock).mockResolvedValue(mockConversation);

      await expect(
        MessageService.deleteConversation(mockConversationId, mockUserId1)
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
