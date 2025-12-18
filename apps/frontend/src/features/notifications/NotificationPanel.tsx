import { Link } from 'react-router-dom';
import { X, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetNotificationsQuery, useMarkAsReadMutation } from './notificationsApi';
import { useAppDispatch } from '@/app/hooks';
import { setNotificationPanelOpen } from '@/features/ui/uiSlice';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, cn } from '@/lib/utils';
import { NotificationType } from '@ichgram/shared-types';

interface NotificationPanelProps {
  isOpen: boolean;
}

export function NotificationPanel({ isOpen }: NotificationPanelProps) {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetNotificationsQuery({ limit: 50 }, { skip: !isOpen });
  const [markAsRead] = useMarkAsReadMutation();

  const handleClose = () => {
    dispatch(setNotificationPanelOpen(false));
  };

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
    dispatch(setNotificationPanelOpen(false));
  };

  const notifications = data?.data?.notifications || [];

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
      case NotificationType.COMMENT:
      case NotificationType.COMMENT_REPLY:
        return <MessageCircle className="h-4 w-4 text-instagram-blue" />;
      case NotificationType.FOLLOW:
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LIKE:
        return 'liked your post.';
      case NotificationType.COMMENT:
        return 'commented on your post.';
      case NotificationType.COMMENT_REPLY:
        return 'replied to your comment.';
      case NotificationType.FOLLOW:
        return 'started following you.';
      default:
        return '';
    }
  };

  const getNotificationLink = (notification: (typeof notifications)[0]) => {
    if (notification.type === NotificationType.FOLLOW) {
      return ROUTES.PROFILE(notification.sender.username);
    }
    return ROUTES.HOME; // Would ideally link to the specific post
  };

  return (
    <div
      className={cn(
        'fixed left-[72px] top-0 h-full w-[400px] bg-background border-r border-border shadow-xl z-40 transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Notifications</h2>
            <button onClick={handleClose} className="hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications yet.</p>
            </div>
          )}

          {!isLoading && notifications.length > 0 && (
            <div className="py-2">
              {notifications.map((notification) => (
                <Link
                  key={notification._id}
                  to={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification._id, notification.isRead)}
                  className={cn(
                    'flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors',
                    !notification.isRead && 'bg-blue-50'
                  )}
                >
                  <Avatar className="h-11 w-11">
                    <AvatarImage
                      src={getImageUrl(notification.sender.avatar)}
                      alt={notification.sender.username}
                    />
                    <AvatarFallback>
                      {notification.sender.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{notification.sender.username}</span>{' '}
                      {getNotificationText(notification.type)}{' '}
                      <span className="text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

