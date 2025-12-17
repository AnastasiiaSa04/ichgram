import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SearchPanel } from '@/features/search/SearchPanel';
import { NotificationPanel } from '@/features/notifications/NotificationPanel';
import { CreatePostModal } from '@/features/posts/CreatePostModal';
import { useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const { isSearchPanelOpen, isNotificationPanelOpen, isCreatePostModalOpen } = useAppSelector(
    (state) => state.ui
  );

  const isPanelOpen = isSearchPanelOpen || isNotificationPanelOpen;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Search Panel */}
      <SearchPanel isOpen={isSearchPanelOpen} />
      
      {/* Notification Panel */}
      <NotificationPanel isOpen={isNotificationPanelOpen} />
      
      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300',
          isPanelOpen ? 'ml-[72px]' : 'ml-[245px]'
        )}
      >
        <div className="mx-auto max-w-[935px] px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Create Post Modal */}
      <CreatePostModal open={isCreatePostModalOpen} />
    </div>
  );
}

