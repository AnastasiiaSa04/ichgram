import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout as logoutAction, setCredentials, updateUser } from '@/features/auth/authSlice';
import { useLogoutMutation, useGetMeQuery } from '@/features/auth/authApi';
import { baseApi } from '@/app/api/baseApi';
import { ROUTES } from '@/lib/constants';
import type { User } from '@ichgram/shared-types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const [logoutMutation] = useLogoutMutation();

  // Fetch current user data on mount if authenticated
  const { refetch: refetchMe } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Logout even if API call fails
    } finally {
      dispatch(logoutAction());
      dispatch(baseApi.util.resetApiState());
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [dispatch, logoutMutation, navigate]);

  const setAuth = useCallback(
    (data: { user: User; accessToken: string; refreshToken: string }) => {
      dispatch(setCredentials(data));
    },
    [dispatch]
  );

  const updateCurrentUser = useCallback(
    (data: Partial<User>) => {
      dispatch(updateUser(data));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    accessToken,
    logout,
    setAuth,
    updateCurrentUser,
    refetchMe,
  };
}

