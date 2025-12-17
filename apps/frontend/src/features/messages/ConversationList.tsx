import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetConversationsQuery } from './messagesApi';
import { useAppSelector } from '@/app/hooks';
import { useSocket } from '@/contexts/SocketContext';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, cn, truncate } from '@/lib/utils';

interface ConversationListProps {
  activeConversationId?: string;
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { onlineUsers } = useSocket();
  const { data, isLoading } = useGetConversationsQuery();

  const conversations = data?.data?.conversations || [];

  return (
    <div className="w-[350px] border-r border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-lg">{user?.username}</h2>
        <button className="hover:opacity-70">
          <Edit className="h-5 w-5" />
        </button>
      </div>

      {/* Messages label */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold">Messages</span>
        <span className="text-sm text-muted-foreground">Requests</span>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No conversations yet.</p>
          </div>
        )}

        {!isLoading &&
          conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find((p) => p._id !== user?._id);
            if (!otherParticipant) return null;

            const isOnline = onlineUsers.has(otherParticipant._id);
            const isActive = activeConversationId === conversation._id;

            return (
              <Link
                key={conversation._id}
                to={`${ROUTES.MESSAGES}/${conversation._id}`}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors',
                  isActive && 'bg-gray-100'
                )}
              >
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage
                      src={getImageUrl(otherParticipant.avatar)}
                      alt={otherParticipant.username}
                    />
                    <AvatarFallback>
                      {otherParticipant.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{otherParticipant.username}</p>
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="truncate">
                        {truncate(conversation.lastMessage.content, 30)}
                      </span>
                      <span>·</span>
                      <span className="flex-shrink-0">
                        {formatRelativeTime(conversation.lastMessage.createdAt)}
                      </span>
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}

