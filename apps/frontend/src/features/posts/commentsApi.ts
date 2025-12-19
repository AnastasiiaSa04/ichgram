import { baseApi } from '@/app/api/baseApi';
import type { ApiSuccessResponse } from '@ichgram/shared-types';

interface GetCommentsParams {
  postId: string;
  page?: number;
  limit?: number;
}

interface AddCommentRequest {
  postId: string;
  content: string;
}

interface CommentWithUser {
  _id: string;
  post: string;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  repliesCount: number;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentsResponse {
  comments: CommentWithUser[];
  total: number;
  pages: number;
}

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<ApiSuccessResponse<CommentsResponse>, GetCommentsParams>({
      query: ({ postId, page = 1, limit = 20 }) =>
        `/comments/post/${postId}?page=${page}&limit=${limit}`,
      providesTags: (result, _error, { postId }) =>
        result?.data?.comments
          ? [
              ...result.data.comments.map(({ _id }) => ({ type: 'Comment' as const, id: _id })),
              { type: 'Comment', id: `POST_${postId}` },
            ]
          : [{ type: 'Comment', id: `POST_${postId}` }],
    }),
    addComment: builder.mutation<
      ApiSuccessResponse<{ comment: CommentWithUser }>,
      AddCommentRequest
    >({
      query: ({ postId, content }) => ({
        url: `/comments/post/${postId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Post', id: postId },
      ],
    }),
    deleteComment: builder.mutation<
      ApiSuccessResponse<null>,
      { commentId: string; postId: string }
    >({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
        { type: 'Post', id: postId },
      ],
    }),
    likeComment: builder.mutation<ApiSuccessResponse<null>, { commentId: string; postId: string }>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { postId }) => [{ type: 'Comment', id: `POST_${postId}` }],
    }),
    unlikeComment: builder.mutation<
      ApiSuccessResponse<null>,
      { commentId: string; postId: string }
    >({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { postId }) => [{ type: 'Comment', id: `POST_${postId}` }],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
} = commentsApi;
