import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, Menu, User } from 'lucide-react';
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
import { Logo } from '@/components/ui/Logo';

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
              <Logo collapsed />
            </div>
          ) : (
            <Logo />
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
        <NavItem icon={<Menu className="h-6 w-6" />} label="More" isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}
