import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from '../config/config'
import type { IUser, IAuthResponse } from '../types/auth.types'
import type { IWeb3NonceResponse, IWeb3NonceRequest, IWeb3AuthRequest } from '../types/web3.types'
import type {
  IMyBet,
  IBetCreate,
  INotification,
  IPrediction,
  IPredictionDetail,
  IRequest,
  IRequestCreate,
  PaginatedResponse,
  IBet,
  IComment,
  ICommentCreate,
  ISettings,
} from '../types/app.types'
import { LOCAL_STORAGE_TOKEN_KEY, setLoading } from '../store/auth.slice'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['User', 'Requests', 'Predictions', 'MyBets', 'Bets', 'Groups', 'Comments'],
  endpoints: (builder) => ({
    // Client endpoints
    getConfig: builder.query<ISettings, void>({
      query: () => 'config',
    }),
    deposit: builder.mutation<void, void>({
      query: () => 'deposit',
    }),
    // Auth endpoints
    w3nonce: builder.mutation<IWeb3NonceResponse, IWeb3NonceRequest>({
      query: ({ chain, address }) => ({
        url: 'auth/web3',
        params: { chain, address },
      }),
    }),
    w3auth: builder.mutation<IAuthResponse, IWeb3AuthRequest>({
      query: ({ message, signature }) => ({
        url: 'auth/web3',
        method: 'POST',
        body: { message, signature },
      }),
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') return 'server unreacheble'
        return 'invalid signature'
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        await queryFulfilled
      },
    }),
    emailNonce: builder.mutation<{ expire: number }, { email: string }>({
      query: (payload) => ({
        url: 'auth/email',
        params: payload,
      }),
    }),
    emailAuth: builder.mutation<IAuthResponse, { email: string; nonce: string }>({
      query: (payload) => ({
        url: 'auth/email',
        method: 'POST',
        body: payload,
      }),
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') return 'server unreacheble'
        return 'invalid nonce'
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        await queryFulfilled
      },
    }),
    singOut: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user',
        method: 'DELETE',
      }),
    }),
    getUser: builder.query<IUser, void>({
      query: () => 'auth/user',
      providesTags: ['User'],
    }),
    getNotifications: builder.query<INotification[], void>({
      query: () => 'auth/user/notification',
    }),
    readNotification: builder.mutation<void, number>({
      query: (payload) => ({
        url: `auth/user/notification/${payload}`,
        method: 'PUT',
      }),
    }),
    readAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user/notification/all/read',
        method: 'PUT',
      }),
    }),
    deleteNotification: builder.mutation<void, number>({
      query: (payload) => ({
        url: `auth/user/notification/${payload}`,
        method: 'DELETE',
      }),
    }),
    deleteAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user/notification/all/delete',
        method: 'DELETE',
      }),
    }),
    // User endpoints
    setTelegram: builder.mutation<IAuthResponse, { nonce: string }>({
      query: (payload) => ({
        url: 'auth/user/telegram',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['User'],
    }),

    // Protected endpoints
    getRequests: builder.query<PaginatedResponse<IRequest>, void>({
      query: () => 'request',
      providesTags: ['Requests'],
    }),
    createRequest: builder.mutation<any, IRequestCreate>({
      query: (payload) => ({
        url: 'request',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Requests'],
    }),
    getMyBets: builder.query<PaginatedResponse<IMyBet>, void>({
      query: () => 'bet/my',
      providesTags: ['MyBets'],
    }),
    createMyBet: builder.mutation<void, IBetCreate>({
      query: (payload) => ({
        url: 'bet/my',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['MyBets'],
    }),
    getBets: builder.query<PaginatedResponse<IBet>, { id: number; limit?: number; offset?: number }>({
      query: ({ id, limit = 10, offset = 0 }) => ({
        url: 'bet',
        params: { prediction: id, limit, offset },
      }),
      providesTags: ['Bets'],
    }),
    getComments: builder.query<PaginatedResponse<IComment>, { id: number; limit?: number; offset?: number }>({
      query: ({ id, limit = 10, offset = 0 }) => ({
        url: `prediction/${id}/comments`,
        params: { limit, offset },
      }),
      providesTags: ['Comments'],
    }),
    createComment: builder.mutation<IComment, ICommentCreate>({
      query: (payload) => ({
        url: `prediction/${payload.prediction}/comments`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Comments'],
    }),
    deleteComment: builder.mutation<void, { predictionId: number; commentId: number }>({
      query: ({ predictionId, commentId }) => ({
        url: `prediction/${predictionId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),
    addLike: builder.mutation<void, { comment: number }>({
      query: ({ comment }) => ({
        url: `comments/${comment}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Comments'],
    }),
    removeLike: builder.mutation<void, { comment: number }>({
      query: ({ comment }) => ({
        url: `comments/${comment}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),

    // Public endpoints
    getPredictions: builder.query<PaginatedResponse<IPrediction>, void>({
      query: () => 'prediction',
      providesTags: ['Predictions'],
    }),
    searchPredictions: builder.query<any[], string>({
      query: (searchQuery) => `prediction/search?q=${encodeURIComponent(searchQuery)}`,
      providesTags: ['Predictions'],
    }),
    getPrediction: builder.query<IPredictionDetail, number>({
      query: (id) => `prediction/${id}`,
      // providesTags: ['Predictions'],
    }),
  }),
})

export const {
  useGetConfigQuery,
  useDepositMutation,
  useW3nonceMutation,
  useW3authMutation,
  useEmailNonceMutation,
  useEmailAuthMutation,
  useGetUserQuery,
  useSingOutMutation,
  // Notifications
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  // ------
  useCreateRequestMutation,
  useGetMyBetsQuery,
  useCreateMyBetMutation,
  useGetBetsQuery,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useAddLikeMutation,
  useRemoveLikeMutation,
  // ------
  useSetTelegramMutation,
  useGetRequestsQuery,
  useGetPredictionsQuery,
  useSearchPredictionsQuery,
  useGetPredictionQuery,
} = api
