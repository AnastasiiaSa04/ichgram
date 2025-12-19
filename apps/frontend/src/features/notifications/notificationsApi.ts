import { baseApi } from '@/app/api/baseApi';
import type { NotificationWithSender, ApiSuccessResponse } from '@ichgram/shared-types';

interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

interface NotificationsResponse {
  notifications: NotificationWithSender[];
  total: number;
  pages: number;
  unreadCount: number;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      ApiSuccessResponse<NotificationsResponse>,
      GetNotificationsParams
    >({
      query: ({ page = 1, limit = 20 }) => `/notifications?page=${page}&limit=${limit}`,
      providesTags: (result) =>
        result?.data?.notifications
          ? [
              ...result.data.notifications.map(({ _id }) => ({
                type: 'Notification' as const,
                id: _id,
              })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),
    getUnreadCount: builder.query<ApiSuccessResponse<{ count: number }>, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
    markAsRead: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, notificationId) => [
        { type: 'Notification', id: notificationId },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ],
    }),
    markAllAsRead: builder.mutation<ApiSuccessResponse<null>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: [
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;
