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
  ISettings,
  PaginatedArg,
  EntityStateWithTotal,
  ITopHolder,
  ITx,
} from '../types/app.types'
import { LOCAL_STORAGE_TOKEN_KEY, setLoading } from '../store/auth.slice'

import { requestsAdapter } from './requests/adapter'
import { wsManager } from './websocket'
import { mybetAdapter } from '../store/mybet.adapter'
import { betAdapter } from '../store/bet.adapter'
import { predictionAdapter } from '../store/prediction.adapter'
import { topAdapter, topSelectors } from '../store/top.adapter'
import { txAdapter } from '../store/tx.adapter'

export const apiBase = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Predictions', 'MyBets', 'Bets', 'Groups'],
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
    }),
    setEmail: builder.mutation<Partial<IUser>, { email: string }>({
      query: (payload) => ({
        url: 'auth/user/email',
        method: 'PUT',
        body: payload,
      }),
    }),
    setUsername: builder.mutation<Partial<IUser>, { username: string }>({
      query: (payload) => ({
        url: 'auth/user',
        method: 'POST',
        body: payload,
      }),
    }),
    getNotifications: builder.query<INotification[], void>({
      query: () => 'auth/user/notification',
    }),
    readAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user/notification/all/read',
        method: 'PUT',
      }),
    }),
    deleteAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user/notification/all/delete',
        method: 'DELETE',
      }),
    }),
    readNotification: builder.mutation<void, number>({
      query: (payload) => ({
        url: `auth/user/notification/${payload}`,
        method: 'PUT',
      }),
    }),
    deleteNotification: builder.mutation<void, number>({
      query: (payload) => ({
        url: `auth/user/notification/${payload}`,
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
    }),

    // Protected endpoints
    getRequests: builder.query<EntityStateWithTotal<IRequest>, PaginatedArg>({
      query: (params) => ({
        url: 'request',
        params,
      }),
      transformResponse: (response: PaginatedResponse<IRequest>) => {
        return { ...requestsAdapter.setAll(requestsAdapter.getInitialState(), response.data), total: response.total }
      },
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }

        const handleUpdated = (request: Partial<IRequest>) => {
          updateCachedData((draft) => {
            if (request.id) requestsAdapter.updateOne(draft, { id: request.id, changes: request })
          })
        }

        const handleCreated = (request: IRequest) => {
          updateCachedData((draft) => {
            requestsAdapter.addOne(draft, request)
          })
        }
        const handleDeleted = (id: number) => {
          updateCachedData((draft) => {
            requestsAdapter.removeOne(draft, id)
          })
        }

        wsManager.subscribe('request.updated', handleUpdated)
        wsManager.subscribe('request.created', handleCreated)
        wsManager.subscribe('request.deleted', handleDeleted)

        await cacheEntryRemoved

        wsManager.unsubscribe('request.updated', handleUpdated)
        wsManager.unsubscribe('request.created', handleCreated)
        wsManager.unsubscribe('request.deleted', handleDeleted)
      },
    }),
    createRequest: builder.mutation<IRequest, IRequestCreate>({
      query: (payload) => ({
        url: 'request',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(
          apiBase.util.updateQueryData('getRequests', undefined, (draft) => {
            requestsAdapter.addOne(draft, data)
          }),
        )
      },
    }),
    getMyBets: builder.query<EntityStateWithTotal<IMyBet>, PaginatedArg>({
      query: (params) => ({
        url: 'bets',
        params,
      }),
      transformResponse: (response: PaginatedResponse<IMyBet>) => {
        return { ...mybetAdapter.setAll(mybetAdapter.getInitialState(), response.data), total: response.total }
      },
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }

        const handleUpdated = (bet: Partial<IMyBet>) => {
          updateCachedData((draft) => {
            if (bet.id) mybetAdapter.updateOne(draft, { id: bet.id, changes: bet })
          })
        }

        const handleCreated = (bet: IMyBet) => {
          updateCachedData((draft) => {
            mybetAdapter.addOne(draft, bet)
          })
        }

        wsManager.subscribe('my.bet.updated', handleUpdated)
        wsManager.subscribe('my.bet.created', handleCreated)

        await cacheEntryRemoved

        wsManager.unsubscribe('my.bet.updated', handleUpdated)
        wsManager.unsubscribe('my.bet.created', handleCreated)
      },
    }),
    createMyBet: builder.mutation<IMyBet, IBetCreate>({
      query: (payload) => ({
        url: 'bets',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(
          apiBase.util.updateQueryData('getMyBets', undefined, (draft) => {
            mybetAdapter.addOne(draft, data)
          }),
        )
      },
    }),
    getTx: builder.query<EntityStateWithTotal<ITx>, PaginatedArg>({
      query: (params) => ({
        url: 'tx',
        params,
      }),
      transformResponse: (response: PaginatedResponse<ITx>) => {
        return { ...txAdapter.setAll(txAdapter.getInitialState(), response.data), total: response.total }
      },
    }),

    // Public endpoints
    searchPredictions: builder.query<any[], string>({
      query: (searchQuery) => `prediction/search?q=${encodeURIComponent(searchQuery)}`,
    }),
    getPredictions: builder.query<EntityStateWithTotal<IPrediction>, PaginatedArg>({
      query: (params) => ({
        url: 'prediction',
        params,
      }),
      transformResponse: (response: PaginatedResponse<IPrediction>) => {
        return {
          ...predictionAdapter.setAll(predictionAdapter.getInitialState(), response.data),
          total: response.total,
        }
      },
    }),
    getPrediction: builder.query<IPredictionDetail, number>({
      query: (id) => `prediction/${id}`,
    }),
    getBets: builder.query<EntityStateWithTotal<IBet>, PaginatedArg<true>>({
      query: ({ id, ...rest }) => ({
        url: `prediction/${id}/bets`,
        params: rest,
      }),
      transformResponse: (response: PaginatedResponse<IBet>) => {
        return { ...betAdapter.setAll(betAdapter.getInitialState(), response.data), total: response.total }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ id: queryArgs.id }),
      merge: (currentCache, newItems) => {
        currentCache.entities = { ...currentCache.entities, ...newItems.entities }
        currentCache.ids = [...currentCache.ids, ...newItems.ids]
        currentCache.total = newItems.total
      },
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }

        const handleCreated = (bet: IBet) => {
          updateCachedData((draft) => {
            betAdapter.addOne(draft, bet)
          })
        }

        wsManager.subscribe('bet.created', handleCreated)
        await cacheEntryRemoved
        wsManager.unsubscribe('bet.created', handleCreated)
      },
    }),
    getTop: builder.query<EntityStateWithTotal<ITopHolder, string>, PaginatedArg<true>>({
      query: ({ id, ...rest }) => ({
        url: `prediction/${id}/top`,
        params: rest,
      }),
      transformResponse: (response: PaginatedResponse<ITopHolder>) => {
        return { ...topAdapter.setAll(topAdapter.getInitialState(), response.data), total: response.total }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ id: queryArgs.id }),
      merge: (currentCache, newItems) => {
        if (currentCache.total !== newItems.total) currentCache.total = newItems.total
        topAdapter.addMany(currentCache, topSelectors.selectAll(newItems))
      },
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
  useSetEmailMutation,
  useSetUsernameMutation,
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
  useGetTopQuery,
  useGetTxQuery,
  // ------
  useSetTelegramMutation,
  useGetRequestsQuery,
  useGetPredictionsQuery,
  useSearchPredictionsQuery,
  useGetPredictionQuery,
} = apiBase
