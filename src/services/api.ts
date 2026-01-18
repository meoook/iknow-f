import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from '../config/config'
import type { IUser, IAuthResponse } from '../types/auth.types'
import type { IWeb3NonceResponse, IWeb3NonceRequest, IWeb3AuthRequest } from '../types/web3.types'
import type {
  IBet,
  INotification,
  IPrediction,
  IPredictionDetail,
  IRequest,
  IRequestCreate,
  PaginatedResponse,
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
  tagTypes: ['User', 'Requests', 'Predictions', 'Bets', 'Groups'],
  endpoints: (builder) => ({
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
    getBets: builder.query<PaginatedResponse<IBet>, void>({
      query: () => 'bet',
      providesTags: ['Bets'],
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
  // ------
  useSetTelegramMutation,
  useGetRequestsQuery,
  useGetBetsQuery,
  useGetPredictionsQuery,
  useSearchPredictionsQuery,
  useGetPredictionQuery,
} = api
