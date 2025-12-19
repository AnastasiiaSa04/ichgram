import { baseApi } from '@/app/api/baseApi';
import type { ApiSuccessResponse } from '@ichgram/shared-types';

export const likesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    likePost: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (postId) => ({
        url: `/likes/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
    unlikePost: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (postId) => ({
        url: `/likes/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED' },
      ],
    }),
  }),
});

export const { useLikePostMutation, useUnlikePostMutation } = likesApi;
