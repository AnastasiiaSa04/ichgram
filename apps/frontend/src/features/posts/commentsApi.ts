import { baseApi } from '@/app/api/baseApi';
import type { Comment, ApiSuccessResponse, PaginatedResponse } from '@ichgram/shared-types';

interface GetCommentsParams {
  postId: string;
  page?: number;
  limit?: number;
}

interface AddCommentRequest {
  postId: string;
  text: string;
}

interface CommentWithUser extends Omit<Comment, 'userId'> {
  userId: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<ApiSuccessResponse<PaginatedResponse<CommentWithUser>>, GetCommentsParams>({
      query: ({ postId, page = 1, limit = 20 }) =>
        `/comments/posts/${postId}?page=${page}&limit=${limit}`,
      providesTags: (result, _error, { postId }) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({ type: 'Comment' as const, id: _id })),
              { type: 'Comment', id: `POST_${postId}` },
            ]
          : [{ type: 'Comment', id: `POST_${postId}` }],
    }),
    addComment: builder.mutation<ApiSuccessResponse<CommentWithUser>, AddCommentRequest>({
      query: ({ postId, text }) => ({
        url: `/comments/posts/${postId}`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Post', id: postId },
      ],
    }),
    deleteComment: builder.mutation<ApiSuccessResponse<null>, { commentId: string; postId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Post', id: postId },
      ],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;

