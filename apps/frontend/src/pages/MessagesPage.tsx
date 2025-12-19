import { useParams } from 'react-router-dom';
import { ConversationList } from '@/features/messages/ConversationList';
import { ChatWindow } from '@/features/messages/ChatWindow';

export default function MessagesPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white border border-border rounded-sm overflow-hidden -mx-4 -my-8">
      <ConversationList activeConversationId={conversationId} />
      {conversationId ? (
        <ChatWindow conversationId={conversationId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto border-2 border-foreground rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-1">Your messages</h3>
            <p className="text-sm">Send private messages to a friend</p>
          </div>
        </div>
      )}
    </div>
  );
}
