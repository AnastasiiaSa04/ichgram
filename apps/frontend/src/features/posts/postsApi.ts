import { baseApi } from '@/app/api/baseApi';
import type { PostWithUser, ApiSuccessResponse } from '@ichgram/shared-types';

interface GetFeedParams {
  page?: number;
  limit?: number;
}

interface GetUserPostsParams {
  userId: string;
  page?: number;
  limit?: number;
}

interface UpdatePostRequest {
  postId: string;
  caption: string;
}

interface PostsResponse {
  posts: PostWithUser[];
  total: number;
  pages: number;
}

export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<ApiSuccessResponse<PostsResponse>, GetFeedParams>({
      query: ({ page = 1, limit = 10 }) => `/posts/feed?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data?.posts
          ? [
              ...result.data.posts.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: 'FEED' },
            ]
          : [{ type: 'Post', id: 'FEED' }],
    }),
    getUserPosts: builder.query<ApiSuccessResponse<PostsResponse>, GetUserPostsParams>({
      query: ({ userId, page = 1, limit = 12 }) =>
        `/posts/user/${userId}?page=${page}&limit=${limit}`,
      providesTags: (result, _error, { userId }) =>
        result?.data?.posts
          ? [
              ...result.data.posts.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: `USER_${userId}` },
            ]
          : [{ type: 'Post', id: `USER_${userId}` }],
    }),
    getPost: builder.query<ApiSuccessResponse<{ post: PostWithUser }>, string>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),
    createPost: builder.mutation<ApiSuccessResponse<PostWithUser>, FormData>({
      query: (data) => ({
        url: '/posts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Post', id: 'FEED' }],
    }),
    updatePost: builder.mutation<ApiSuccessResponse<PostWithUser>, UpdatePostRequest>({
      query: ({ postId, caption }) => ({
        url: `/posts/${postId}`,
        method: 'PUT',
        body: { caption },
      }),
      invalidatesTags: (_result, _error, { postId }) => [{ type: 'Post', id: postId }],
    }),
    deletePost: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (postId) => ({
        url: `/posts/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Post', id: 'FEED' }],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetUserPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;

