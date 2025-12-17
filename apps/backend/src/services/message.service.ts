import { Message, IMessage } from '../models/Message.model';
import { Conversation, IConversation } from '../models/Conversation.model';
import { User } from '../models/User.model';
import { NotFoundError, ForbiddenError } from '../utils/ApiError';
import mongoose from 'mongoose';

interface CreateMessageData {
  sender: string;
  recipient: string;
  content: string;
}

interface PopulatedSender {
  _id: mongoose.Types.ObjectId;
  username: string;
  avatar?: string;
}

interface PopulatedMessage {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  sender: PopulatedSender;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface PopulatedParticipant {
  _id: mongoose.Types.ObjectId;
  username: string;
  fullName?: string;
  avatar?: string;
}

interface PopulatedConversation {
  _id: mongoose.Types.ObjectId;
  participants: PopulatedParticipant[];
  lastMessage?: {
    _id: mongoose.Types.ObjectId;
    sender: PopulatedSender;
    content: string;
    createdAt: Date;
  };
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageService {
  static async sendMessage(data: CreateMessageData): Promise<IMessage> {
    const recipient = await User.findById(data.recipient);
    if (!recipient) {
      throw new NotFoundError('Recipient user');
    }

    const participantIds = [data.sender, data.recipient].sort();

    let conversation = await Conversation.findOne({
      participants: { $all: participantIds, $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: participantIds,
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: data.sender,
      content: data.content,
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: message.createdAt,
    });

    return message.populate('sender', 'username avatar');
  }

  static async getConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    conversations: PopulatedConversation[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const rawConversations = await Conversation.find({
      participants: userId,
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('participants', 'username fullName avatar')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar',
        },
      })
      .lean();

    const conversations: PopulatedConversation[] = rawConversations.map((conv) => {
      const result: PopulatedConversation = {
        _id: conv._id,
        participants: (conv.participants as any[]).map((p) => ({
          _id: p._id,
          username: p.username,
          fullName: p.fullName,
          avatar: p.avatar,
        })),
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };

      if (conv.lastMessage) {
        const lastMsg = conv.lastMessage as any;
        result.lastMessage = {
          _id: lastMsg._id,
          sender: {
            _id: lastMsg.sender._id,
            username: lastMsg.sender.username,
            avatar: lastMsg.sender.avatar,
          },
          content: lastMsg.content,
          createdAt: lastMsg.createdAt,
        };
      }

      return result;
    });

    const total = await Conversation.countDocuments({ participants: userId });
    const pages = Math.ceil(total / limit);

    return { conversations, total, pages };
  }

  static async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    messages: PopulatedMessage[];
    total: number;
    pages: number;
  }> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    const skip = (page - 1) * limit;

    const rawMessages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .lean();

    const messages: PopulatedMessage[] = rawMessages.map((msg) => ({
      _id: msg._id,
      conversation: msg.conversation,
      sender: {
        _id: (msg.sender as any)._id,
        username: (msg.sender as any).username,
        avatar: (msg.sender as any).avatar,
      },
      content: msg.content,
      isRead: msg.isRead,
      readAt: msg.readAt,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    const total = await Message.countDocuments({ conversation: conversationId });
    const pages = Math.ceil(total / limit);

    return { messages: messages.reverse(), total, pages };
  }

  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const conversations = await Conversation.find({
      participants: userId,
    }).select('_id');

    const conversationIds = conversations.map((c) => c._id);

    const count = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: userId },
      isRead: false,
    });

    return count;
  }

  static async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this conversation');
    }

    await Message.deleteMany({ conversation: conversationId });
    await Conversation.findByIdAndDelete(conversationId);
  }
}
