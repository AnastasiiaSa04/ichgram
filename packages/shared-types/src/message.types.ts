import { UserBasic } from './user.types';

export interface Message {
  _id: string;
  conversation: string;
  sender: string | UserBasic;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageWithSender extends Omit<Message, 'sender'> {
  sender: UserBasic;
}

export interface Conversation {
  _id: string;
  participants: string[] | UserBasic[];
  lastMessage?: string | Message;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithParticipants extends Omit<Conversation, 'participants' | 'lastMessage'> {
  participants: UserBasic[];
  lastMessage?: {
    _id: string;
    sender: UserBasic;
    content: string;
    createdAt: Date;
  };
}
