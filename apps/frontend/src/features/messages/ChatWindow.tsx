import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Info, Send, Smile } from 'lucide-react';
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
import { getImageUrl, cn } from '@/lib/utils';
import type { MessageWithSender } from '@ichgram/shared-types';

// Format date for message groups
function formatMessageDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

  const conversation = conversationsData?.data?.conversations?.find(
    (c) => c._id === conversationId
  );
  const otherParticipant = conversation?.participants.find((p) => p._id !== user?._id);
  const messages = useMemo(
    () => messagesData?.data?.messages || [],
    [messagesData?.data?.messages]
  );
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
    if (!message.trim() || !otherParticipant) return;

    try {
      await sendMessage({ recipient: otherParticipant._id, content: message.trim() }).unwrap();
      setMessage('');

      // Emit stop typing
      socket?.emit('message:stop_typing', { conversationId });
    } catch {
      // Handle error
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [socket, conversationId]
  );

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
      <div className="flex items-center justify-between h-[75px] px-4 border-b border-[#dbdbdb]">
        <Link
          to={ROUTES.PROFILE(otherParticipant.username)}
          className="flex items-center gap-3 hover:opacity-70"
        >
          <div className="relative">
            <Avatar className="h-11 w-11 border border-black/10">
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
          <p className="font-semibold text-base">{otherParticipant.username}</p>
        </Link>
        <button className="hover:opacity-70">
          <Info className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && (
          <>
            {/* User Profile Header */}
            <div className="flex flex-col items-center py-8">
              <Link to={ROUTES.PROFILE(otherParticipant.username)}>
                <Avatar className="h-24 w-24 border border-black/10">
                  <AvatarImage
                    src={getImageUrl(otherParticipant.avatar)}
                    alt={otherParticipant.username}
                  />
                  <AvatarFallback className="text-2xl">
                    {otherParticipant.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <h3 className="font-semibold text-xl mt-4">{otherParticipant.username}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {otherParticipant.username} · ICHgram
              </p>
              <Link
                to={ROUTES.PROFILE(otherParticipant.username)}
                className="mt-4 px-6 py-2 bg-[#efefef] hover:bg-[#dbdbdb] rounded-lg font-semibold text-sm transition-colors"
              >
                View profile
              </Link>
            </div>

            {/* Date Separator */}
            {messages.length > 0 && (
              <div className="flex justify-center py-4">
                <span className="text-xs text-[#65676b] font-medium">
                  {formatMessageDate(messages[0].createdAt)}
                </span>
              </div>
            )}

            {/* Messages List */}
            <div className="space-y-2 pb-4">
              {messages.map((msg) => {
                const isOwn = msg.sender._id === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={cn('flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}
                  >
                    {/* Other user's avatar (left side) */}
                    {!isOwn && (
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage
                          src={getImageUrl(otherParticipant.avatar)}
                          alt={otherParticipant.username}
                        />
                        <AvatarFallback className="text-xs">
                          {otherParticipant.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[60%] rounded-[15px] px-4 py-3',
                        isOwn ? 'bg-[#4d00ff] text-white' : 'bg-[#efefef] text-black'
                      )}
                    >
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    </div>
                    {/* Current user's avatar (right side) */}
                    {isOwn && (
                      <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={getImageUrl(user?.avatar)} alt={user?.username} />
                        <AvatarFallback className="text-xs">
                          {user?.username?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage
                      src={getImageUrl(otherParticipant.avatar)}
                      alt={otherParticipant.username}
                    />
                    <AvatarFallback className="text-xs">
                      {otherParticipant.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#efefef] rounded-[15px] px-4 py-3">
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
            </div>
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="px-4 py-3">
        <div className="flex items-center gap-3 border border-[#dbdbdb] rounded-[22px] px-4 py-2">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Smile className="h-6 w-6" />
          </button>
          <input
            type="text"
            placeholder="Write message"
            value={message}
            onChange={handleInputChange}
            className="flex-1 text-sm bg-transparent outline-none"
          />
          {message.trim() && (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#4d00ff] hover:text-[#4d00ff]/80"
              disabled={isSending}
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
