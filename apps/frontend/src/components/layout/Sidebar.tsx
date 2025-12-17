import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
  User,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  toggleSearchPanel,
  toggleNotificationPanel,
  openCreatePostModal,
  closePanels,
} from '@/features/ui/uiSlice';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
  isActive?: boolean;
  isCollapsed?: boolean;
}

function NavItem({ icon, label, to, onClick, isActive, isCollapsed }: NavItemProps) {
  const content = (
    <>
      <span className={cn('transition-transform', isActive && 'scale-110')}>{icon}</span>
      <span
        className={cn(
          'ml-4 transition-opacity duration-200',
          isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
        )}
      >
        {label}
      </span>
    </>
  );

  const className = cn(
    'flex items-center gap-0 p-3 rounded-lg w-full text-left transition-all hover:bg-gray-100',
    isActive && 'font-bold'
  );

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function Sidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isSearchPanelOpen, isNotificationPanelOpen } = useAppSelector((state) => state.ui);

  const isCollapsed = isSearchPanelOpen || isNotificationPanelOpen;

  const handleSearchClick = () => {
    dispatch(toggleSearchPanel());
  };

  const handleNotificationClick = () => {
    dispatch(toggleNotificationPanel());
  };

  const handleCreateClick = () => {
    dispatch(closePanels());
    dispatch(openCreatePostModal());
  };

  const handleNavClick = () => {
    dispatch(closePanels());
  };

  const navItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: 'Home',
      to: ROUTES.HOME,
      isActive: location.pathname === ROUTES.HOME && !isSearchPanelOpen && !isNotificationPanelOpen,
      onClick: handleNavClick,
    },
    {
      icon: <Search className="h-6 w-6" />,
      label: 'Search',
      onClick: handleSearchClick,
      isActive: isSearchPanelOpen,
    },
    {
      icon: <Compass className="h-6 w-6" />,
      label: 'Explore',
      to: ROUTES.EXPLORE,
      isActive: location.pathname === ROUTES.EXPLORE,
      onClick: handleNavClick,
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      label: 'Messages',
      to: ROUTES.MESSAGES,
      isActive: location.pathname.startsWith(ROUTES.MESSAGES),
      onClick: handleNavClick,
    },
    {
      icon: <Heart className="h-6 w-6" />,
      label: 'Notifications',
      onClick: handleNotificationClick,
      isActive: isNotificationPanelOpen,
    },
    {
      icon: <PlusSquare className="h-6 w-6" />,
      label: 'Create',
      onClick: handleCreateClick,
    },
    {
      icon: (
        <Avatar className="h-6 w-6">
          <AvatarImage src={getImageUrl(user?.avatar)} alt={user?.username} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      ),
      label: 'Profile',
      to: user ? ROUTES.PROFILE(user.username) : '#',
      isActive: location.pathname === (user ? ROUTES.PROFILE(user.username) : ''),
      onClick: handleNavClick,
    },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full border-r border-border bg-background z-50 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-[72px]' : 'w-[245px]'
      )}
    >
      {/* Logo */}
      <div className="p-4 pt-6 pb-4">
        <Link to={ROUTES.HOME} className="block" onClick={handleNavClick}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
                  fill="currentColor"
                />
              </svg>
            </div>
          ) : (
            <h1 className="text-2xl font-serif italic">Ichgram</h1>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavItem
                icon={item.icon}
                label={item.label}
                to={item.to}
                onClick={item.onClick}
                isActive={item.isActive}
                isCollapsed={isCollapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu */}
      <div className="p-2 pb-6">
        <NavItem
          icon={<Menu className="h-6 w-6" />}
          label="More"
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  );
}

