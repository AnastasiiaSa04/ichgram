import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SocketProvider } from '@/contexts/SocketContext';

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function App() {
  return (
    <SocketProvider>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/messages/:conversationId" element={<MessagesPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/settings/edit" element={<EditProfilePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
    </SocketProvider>
  );
}

export default App;


