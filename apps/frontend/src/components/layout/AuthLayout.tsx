import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/lib/constants';

export function AuthLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}

