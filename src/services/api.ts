import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { EntityState } from '@reduxjs/toolkit'
import { createEntityAdapter } from '@reduxjs/toolkit'
import { wsManager } from './websocket'
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
  ICommentReport,
} from '../types/app.types'
import { LOCAL_STORAGE_TOKEN_KEY, setLoading } from '../store/auth.slice'

export const commentsAdapter = createEntityAdapter<IComment>({
  sortComparer: (a, b) => b.created - a.created,
})

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
  tagTypes: ['User', 'Requests', 'Predictions', 'MyBets', 'Bets', 'Groups'],
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

    // Comments endpoints
    getComments: builder.query<EntityState<IComment, number>, { id: number; limit?: number; offset?: number }>({
      query: ({ id, limit = 10, offset = 0 }) => ({
        url: `prediction/${id}/comments`,
        params: { limit, offset },
      }),
      transformResponse: (response: PaginatedResponse<IComment>) => {
        return commentsAdapter.setAll(commentsAdapter.getInitialState(), response.data)
      },
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }
        wsManager.predictionJoin(arg.id)

        const handleCreated = (comment: IComment) => {
          updateCachedData((draft) => {
            commentsAdapter.addOne(draft, comment)
          })
        }
        const handleUpdated = (comment: IComment) => {
          updateCachedData((draft) => {
            commentsAdapter.upsertOne(draft, comment)
          })
        }
        const handleDeleted = (id: number) => {
          updateCachedData((draft) => {
            commentsAdapter.removeOne(draft, id)
          })
        }
        const handleLike = (id: number) => {
          updateCachedData((draft) => {
            const comment = draft.entities[id]
            if (comment) commentsAdapter.updateOne(draft, { id, changes: { reactions: (comment.reactions || 0) + 1 } })
          })
        }
        const handleDislike = (id: number) => {
          updateCachedData((draft) => {
            const comment = draft.entities[id]
            if (comment) commentsAdapter.updateOne(draft, { id, changes: { reactions: (comment.reactions || 0) - 1 } })
          })
        }

        wsManager.subscribe('comment.created', handleCreated)
        wsManager.subscribe('comment.updated', handleUpdated)
        wsManager.subscribe('comment.deleted', handleDeleted)
        wsManager.subscribe('comment.like', handleLike)
        wsManager.subscribe('comment.dislike', handleDislike)

        await cacheEntryRemoved

        wsManager.predictionLeave(arg.id)

        wsManager.unsubscribe('comment.created', handleCreated)
        wsManager.unsubscribe('comment.updated', handleUpdated)
        wsManager.unsubscribe('comment.deleted', handleDeleted)
        wsManager.unsubscribe('comment.like', handleLike)
        wsManager.unsubscribe('comment.dislike', handleDislike)
      },
    }),
    createComment: builder.mutation<IComment, ICommentCreate>({
      query: (payload) => ({
        url: `prediction/${payload.prediction}/comments`,
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(
          api.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            commentsAdapter.addOne(draft, data)
          }),
        )
      },
    }),
    deleteComment: builder.mutation<void, { prediction: number; comment: number }>({
      query: ({ prediction, comment }) => ({
        url: `prediction/${prediction}/comments/${comment}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            commentsAdapter.removeOne(draft, arg.comment)
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    addLike: builder.mutation<void, { prediction: number; comment: number }>({
      query: ({ prediction, comment }) => ({
        url: `prediction/${prediction}/comments/${comment}/like`,
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            const comment = draft.entities[arg.comment]
            if (comment) {
              commentsAdapter.updateOne(draft, {
                id: arg.comment,
                changes: { reactions: (comment.reactions || 0) + 1, is_liked: true },
              })
            }
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    removeLike: builder.mutation<void, { prediction: number; comment: number }>({
      query: ({ prediction, comment }) => ({
        url: `prediction/${prediction}/comments/${comment}/like`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            const comment = draft.entities[arg.comment]
            if (comment) {
              commentsAdapter.updateOne(draft, {
                id: arg.comment,
                changes: { reactions: (comment.reactions || 0) - 1, is_liked: false },
              })
            }
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    reportComment: builder.mutation<void, ICommentReport>({
      query: ({ prediction, comment, reason, text }) => ({
        url: `prediction/${prediction}/comments/${comment}/report`,
        method: 'POST',
        body: { reason, text },
      }),
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
  useReportCommentMutation,
  // ------
  useSetTelegramMutation,
  useGetRequestsQuery,
  useGetPredictionsQuery,
  useSearchPredictionsQuery,
  useGetPredictionQuery,
} = api
