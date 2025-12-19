import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGetNotificationsQuery, useMarkAsReadMutation } from './notificationsApi';
import { useAppDispatch } from '@/app/hooks';
import { setNotificationPanelOpen } from '@/features/ui/uiSlice';
import { ROUTES } from '@/lib/constants';
import { formatRelativeTime, getImageUrl, cn } from '@/lib/utils';

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

  const getNotificationText = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked your photo.';
      case 'comment':
        return 'commented your photo.';
      case 'comment_reply':
        return 'replied to your comment.';
      case 'comment_like':
        return 'liked your comment.';
      case 'follow':
        return 'started following you.';
      default:
        return '';
    }
  };

  const getNotificationLink = (notification: (typeof notifications)[0]) => {
    if (notification.type === 'follow') {
      return ROUTES.PROFILE(notification.sender.username);
    }
    return ROUTES.HOME;
  };

  return (
    <div
      className={cn(
        'fixed left-[72px] top-0 h-full w-[400px] bg-background border-r border-border shadow-xl z-40 transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Notifications</h2>
            <button onClick={handleClose} className="hover:opacity-70">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

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
              {notifications.map((notification) => {
                const post = notification.post as { _id: string; images: string[] } | undefined;
                const postImage = post?.images?.[0];
                
                return (
                  <Link
                    key={notification._id}
                    to={getNotificationLink(notification)}
                    onClick={() => handleNotificationClick(notification._id, notification.isRead)}
                    className={cn(
                      'flex items-center gap-3 px-6 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                      !notification.isRead && 'bg-blue-50 dark:bg-blue-950'
                    )}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={getImageUrl(notification.sender.avatar)}
                        alt={notification.sender.username}
                      />
                      <AvatarFallback>{notification.sender.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-[18px] text-foreground">
                        <span className="font-semibold">{notification.sender.username}</span>{' '}
                        <span className="font-normal">{getNotificationText(notification.type)}</span>{' '}
                        <span className="text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </p>
                    </div>
                    {postImage && (
                      <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(postImage)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
