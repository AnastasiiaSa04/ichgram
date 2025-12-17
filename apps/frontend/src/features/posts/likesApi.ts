import { baseApi } from '@/app/api/baseApi';
import type { ApiSuccessResponse } from '@ichgram/shared-types';
import { postsApi } from './postsApi';

interface ToggleLikeResponse {
  liked: boolean;
  likesCount: number;
}

export const likesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    toggleLike: builder.mutation<ApiSuccessResponse<ToggleLikeResponse>, string>({
      query: (postId) => ({
        url: `/likes/posts/${postId}`,
        method: 'POST',
      }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        // Optimistic update for feed
        const feedPatch = dispatch(
          postsApi.util.updateQueryData('getFeed', { page: 1, limit: 10 }, (draft) => {
            const post = draft.data.data.find((p) => p._id === postId);
            if (post) {
              post.isLiked = !post.isLiked;
              post.likesCount += post.isLiked ? 1 : -1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          feedPatch.undo();
        }
      },
    }),
  }),
});

export const { useToggleLikeMutation } = likesApi;

