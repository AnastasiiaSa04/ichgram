import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetConversationsQuery } from './messagesApi';
import { useAppSelector } from '@/app/hooks';
import { useSocket } from '@/contexts/SocketContext';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, cn } from '@/lib/utils';

interface ConversationListProps {
  activeConversationId?: string;
}

export function ConversationList({ activeConversationId }: ConversationListProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { onlineUsers } = useSocket();
  const { data, isLoading } = useGetConversationsQuery();

  const conversations = data?.data?.conversations || [];

  return (
    <div className="w-[398px] border-r border-[#dbdbdb] flex flex-col bg-white">
      {/* Header */}
      <div className="h-[75px] flex items-center px-6">
        <h2 className="font-bold text-xl">{user?.username}</h2>
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
                  'flex items-center gap-3 px-6 h-[72px] hover:bg-gray-50 transition-colors',
                  isActive && 'bg-[#efefef]'
                )}
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 border border-black/10">
                    <AvatarImage
                      src={getImageUrl(otherParticipant.avatar)}
                      alt={otherParticipant.username}
                    />
                    <AvatarFallback>{otherParticipant.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-black">{otherParticipant.username}</p>
                  {conversation.lastMessage && (
                    <p className="text-xs text-[#737373] mt-1">
                      <span className="capitalize">{otherParticipant.username}</span>
                      <span> sent a message.</span>
                      <span className="mx-1">·</span>
                      <span>{formatRelativeTime(conversation.lastMessage.createdAt)}</span>
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
