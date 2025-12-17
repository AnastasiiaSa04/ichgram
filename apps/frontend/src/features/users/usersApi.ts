import { baseApi } from '@/app/api/baseApi';
import type { User, UserProfile, ApiSuccessResponse, PaginatedResponse } from '@ichgram/shared-types';

interface UpdateProfileRequest {
  fullName?: string;
  username?: string;
  bio?: string;
}

interface SearchUsersParams {
  query: string;
  limit?: number;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<ApiSuccessResponse<{ user: UserProfile }>, string>({
      query: (username) => `/users/${username}`,
      providesTags: (_result, _error, username) => [{ type: 'User', id: username }],
    }),
    updateProfile: builder.mutation<ApiSuccessResponse<User>, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateAvatar: builder.mutation<ApiSuccessResponse<User>, FormData>({
      query: (data) => ({
        url: '/users/avatar',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    searchUsers: builder.query<ApiSuccessResponse<PaginatedResponse<User>>, SearchUsersParams>({
      query: ({ query, limit = 20 }) => `/search/users?q=${encodeURIComponent(query)}&limit=${limit}`,
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
} = usersApi;

