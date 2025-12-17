import { baseApi } from '@/app/api/baseApi';
import type {
  ConversationWithParticipants,
  MessageWithSender,
  ApiSuccessResponse,
} from '@ichgram/shared-types';

interface GetMessagesParams {
  conversationId: string;
  page?: number;
  limit?: number;
}

interface SendMessageRequest {
  recipient: string;
  content: string;
}

interface CreateConversationRequest {
  participantId: string;
}

interface ConversationsResponse {
  conversations: ConversationWithParticipants[];
  total: number;
  pages: number;
}

interface MessagesResponse {
  messages: MessageWithSender[];
  total: number;
  pages: number;
}

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<ApiSuccessResponse<ConversationsResponse>, void>({
      query: () => '/messages/conversations',
      providesTags: (result) =>
        result?.data?.conversations
          ? [
              ...result.data.conversations.map(({ _id }) => ({ type: 'Conversation' as const, id: _id })),
              { type: 'Conversation', id: 'LIST' },
            ]
          : [{ type: 'Conversation', id: 'LIST' }],
    }),
    getMessages: builder.query<ApiSuccessResponse<MessagesResponse>, GetMessagesParams>({
      query: ({ conversationId, page = 1, limit = 50 }) =>
        `/messages/conversations/${conversationId}?page=${page}&limit=${limit}`,
      providesTags: (result, _error, { conversationId }) =>
        result?.data?.messages
          ? [
              ...result.data.messages.map(({ _id }) => ({ type: 'Message' as const, id: _id })),
              { type: 'Message', id: `CONV_${conversationId}` },
            ]
          : [{ type: 'Message', id: `CONV_${conversationId}` }],
    }),
    sendMessage: builder.mutation<ApiSuccessResponse<{ message: MessageWithSender }>, SendMessageRequest>({
      query: ({ recipient, content }) => ({
        url: `/messages`,
        method: 'POST',
        body: { recipient, content },
      }),
      invalidatesTags: [
        { type: 'Message' },
        { type: 'Conversation' },
      ],
    }),
    createConversation: builder.mutation<ApiSuccessResponse<ConversationWithParticipants>, CreateConversationRequest>({
      query: ({ participantId }) => ({
        url: '/messages/conversations',
        method: 'POST',
        body: { participantId },
      }),
      invalidatesTags: [{ type: 'Conversation', id: 'LIST' }],
    }),
    markConversationAsRead: builder.mutation<ApiSuccessResponse<null>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, conversationId) => [
        { type: 'Conversation', id: conversationId },
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useCreateConversationMutation,
  useMarkConversationAsReadMutation,
} = messagesApi;

