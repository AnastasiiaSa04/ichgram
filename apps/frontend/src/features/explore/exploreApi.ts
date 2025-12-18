import { baseApi } from '@/app/api/baseApi';
import type { PostWithUser, ApiSuccessResponse, PaginatedResponse } from '@ichgram/shared-types';

interface GetExplorePostsParams {
  page?: number;
  limit?: number;
}

export const exploreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExplorePosts: builder.query<ApiSuccessResponse<PaginatedResponse<PostWithUser>>, GetExplorePostsParams>({
      query: ({ page = 1, limit = 30 }) => `/explore?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: 'EXPLORE' },
            ]
          : [{ type: 'Post', id: 'EXPLORE' }],
    }),
  }),
});

export const { useGetExplorePostsQuery } = exploreApi;


