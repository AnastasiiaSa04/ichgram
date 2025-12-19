import { baseApi } from '@/app/api/baseApi';
import type { ApiSuccessResponse, User, PaginatedResponse } from '@ichgram/shared-types';

interface FollowResponse {
  isFollowing: boolean;
}

interface GetFollowersParams {
  userId: string;
  page?: number;
  limit?: number;
}

export const followsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    follow: builder.mutation<ApiSuccessResponse<FollowResponse>, string>({
      query: (userId) => ({
        url: `/follows/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: userId },
        { type: 'Follow', id: userId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    unfollow: builder.mutation<ApiSuccessResponse<FollowResponse>, string>({
      query: (userId) => ({
        url: `/follows/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'User', id: userId },
        { type: 'Follow', id: userId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    getFollowers: builder.query<ApiSuccessResponse<PaginatedResponse<User>>, GetFollowersParams>({
      query: ({ userId, page = 1, limit = 20 }) =>
        `/follows/${userId}/followers?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { userId }) => [
        { type: 'Follow', id: `followers_${userId}` },
      ],
    }),
    getFollowing: builder.query<ApiSuccessResponse<PaginatedResponse<User>>, GetFollowersParams>({
      query: ({ userId, page = 1, limit = 20 }) =>
        `/follows/${userId}/following?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { userId }) => [
        { type: 'Follow', id: `following_${userId}` },
      ],
    }),
  }),
});

export const {
  useFollowMutation,
  useUnfollowMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
} = followsApi;
