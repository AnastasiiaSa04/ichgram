import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Info, Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetConversationsQuery,
  useMarkConversationAsReadMutation,
} from './messagesApi';
import { useAppSelector } from '@/app/hooks';
import { useSocket } from '@/contexts/SocketContext';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, cn } from '@/lib/utils';
import type { MessageWithSender } from '@ichgram/shared-types';

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { socket, onlineUsers } = useSocket();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: conversationsData } = useGetConversationsQuery();
  const { data: messagesData, isLoading } = useGetMessagesQuery({ conversationId });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkConversationAsReadMutation();

  const conversation = conversationsData?.data?.conversations?.find((c) => c._id === conversationId);
  const otherParticipant = conversation?.participants.find((p) => p._id !== user?._id);
  const messages = messagesData?.data?.data || [];
  const isOnline = otherParticipant ? onlineUsers.has(otherParticipant._id) : false;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read when viewing
  useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: { conversationId: string; message: MessageWithSender }) => {
      if (data.conversationId === conversationId) {
        // RTK Query will handle cache update through invalidation
      }
    };

    const handleTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user?._id) {
        setIsTyping(false);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:typing', handleTyping);
    socket.on('message:stop_typing', handleStopTyping);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:typing', handleTyping);
      socket.off('message:stop_typing', handleStopTyping);
    };
  }, [socket, conversationId, user?._id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({ conversationId, content: message.trim() }).unwrap();
      setMessage('');
      
      // Emit stop typing
      socket?.emit('message:stop_typing', { conversationId });
    } catch {
      // Handle error
    }
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Emit typing indicator
    if (socket) {
      socket.emit('message:typing', { conversationId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('message:stop_typing', { conversationId });
      }, 2000);
    }
  }, [socket, conversationId]);

  if (!otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link
          to={ROUTES.PROFILE(otherParticipant.username)}
          className="flex items-center gap-3 hover:opacity-70"
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={getImageUrl(otherParticipant.avatar)}
                alt={otherParticipant.username}
              />
              <AvatarFallback>{otherParticipant.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <p className="font-semibold">{otherParticipant.username}</p>
            {isOnline && <p className="text-xs text-muted-foreground">Active now</p>}
          </div>
        </Link>
        <button className="hover:opacity-70">
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading &&
          messages
            .slice()
            .reverse()
            .map((msg) => {
              const isOwn = msg.sender._id === user?._id;
              return (
                <div
                  key={msg._id}
                  className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      isOwn ? 'bg-instagram-blue text-white' : 'bg-gray-100 text-foreground'
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={cn(
                        'text-xs mt-1',
                        isOwn ? 'text-white/70' : 'text-muted-foreground'
                      )}
                    >
                      {formatRelativeTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex items-center gap-2 border border-border rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Message..."
            value={message}
            onChange={handleInputChange}
            className="flex-1 text-sm bg-transparent outline-none"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 transition-colors',
              message.trim() ? 'text-instagram-blue' : 'text-muted-foreground'
            )}
            disabled={!message.trim() || isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

