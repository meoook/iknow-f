import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { IUser, IAuthResponse, IUserPublic } from '../types/auth.types'
import type { IWeb3NonceResponse, IWeb3NonceRequest, IWeb3AuthRequest } from '../types/web3.types'
import type {
  PaginatedArg,
  EntityStateWithTotal,
  IBetCreate,
  INotification,
  IPrediction,
  IPredictionDetail,
  IRequest,
  IRequestCreate,
  PaginatedResponse,
  IPredictionBet,
  ISettings,
  ITopHolder,
  ITx,
  IPredictionSearch,
  IUserPrediction,
  IUserBet,
  ILeaderboardUser,
  ITopWin,
} from '../types/app.types'
import { setLoading } from '../store/auth.slice'

import { wsManager } from './websocket'
import { requestsAdapter } from '../store/requests.adapter'
import { betAdapter } from '../store/bet.adapter'
import { predictionAdapter, predictionSelectors } from '../store/prediction.adapter'
import { topAdapter, topSelectors } from '../store/top.adapter'
import { txAdapter } from '../store/tx.adapter'
import { getCookie } from '../utils/date'
import { userBetAdapter, userBetSelectors } from '../store/user_bet.adapter'
import { userPredictionAdapter, userPredictionSelectors } from '../store/user_prediction.adapter'
import { leaderboardAdapter, leaderboardSelectors } from '../store/leaderboard.adapter'

export const apiBase = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrf = getCookie('csrftoken')
      if (csrf) headers.set('X-CSRFToken', csrf)
      return headers
    },
  }),
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
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') return 'Сервер не доступен'
        if (response.status === 429) return 'Слишком много запросов, попробуйте позже'
        return 'Ошибка входа'
      },
    }),
    emailAuth: builder.mutation<IAuthResponse, { email: string; nonce: string }>({
      query: (payload) => ({
        url: 'auth/email',
        method: 'POST',
        body: payload,
      }),
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
    // User endpoints
    getUser: builder.query<IUser, void>({
      query: () => 'auth/user',
    }),
    emailApprove: builder.mutation<void, { email: string; nonce: string }>({
      query: (payload) => ({
        url: 'auth/email',
        method: 'POST',
        body: payload,
      }),
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') return 'сервер не доступен'
        if (response.status === 400 && response.data.detail === 'nonce timeout') return 'код просрочен'
        return 'Неверный код'
      },
    }),
    setEmail: builder.mutation<Partial<IUser>, { email: string }>({
      query: (payload) => ({
        url: 'auth/user/email',
        method: 'PUT',
        body: payload,
      }),
    }),
    setUserParams: builder.mutation<Partial<IUser>, Partial<IUser>>({
      query: (payload) => ({
        url: 'auth/user',
        method: 'PUT',
        body: payload,
      }),
    }),
    setAvatar: builder.mutation<Partial<IUser>, File>({
      query: (file: File) => {
        const formData = new FormData()
        formData.append('avatar', file)

        return {
          url: 'auth/user/avatar',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: any) => {
        return { avatar: `${response.avatar}?t=${Date.now()}` }
      },
    }),
    getTelegramNonce: builder.mutation<{ nonce: string }, void>({
      query: () => 'auth/user/telegram',
    }),
    getUserById: builder.query<IUserPublic, string>({
      query: (id) => `user/${id}`,
    }),
    // Notifications endpoints
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

    // Protected endpoints
    getRequests: builder.query<EntityStateWithTotal<IRequest>, PaginatedArg | void>({
      query: (params) => ({
        url: 'request',
        params: params ?? {},
      }),
      transformResponse: (response: PaginatedResponse<IRequest>) => {
        return {
          ...requestsAdapter.setAll(requestsAdapter.getInitialState(), response?.data ?? []),
          total: response?.total ?? 0,
        }
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

        // const handleCreated = (request: IRequest) => {
        //   updateCachedData((draft) => {
        //     requestsAdapter.addOne(draft, request)
        //   })
        // }
        // const handleDeleted = (id: number) => {
        //   updateCachedData((draft) => {
        //     requestsAdapter.removeOne(draft, id)
        //   })
        // }

        wsManager.subscribe('request.updated', handleUpdated)
        // wsManager.subscribe('request.created', handleCreated)
        // wsManager.subscribe('request.deleted', handleDeleted)

        await cacheEntryRemoved

        wsManager.unsubscribe('request.updated', handleUpdated)
        // wsManager.unsubscribe('request.created', handleCreated)
        // wsManager.unsubscribe('request.deleted', handleDeleted)
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
    createBet: builder.mutation<void, IBetCreate>({
      query: ({ prediction_id, ...rest }) => ({
        url: `prediction/${prediction_id}/bets`,
        method: 'POST',
        body: rest,
      }),
    }),
    getTx: builder.query<EntityStateWithTotal<ITx>, PaginatedArg | void>({
      query: (params) => ({
        url: 'tx',
        params: params ?? {},
      }),
      transformResponse: (response: PaginatedResponse<ITx>) => {
        return { ...txAdapter.setAll(txAdapter.getInitialState(), response.data ?? []), total: response.total ?? 0 }
      },
    }),

    // Public endpoints
    searchPredictions: builder.mutation<IPredictionSearch[], string>({
      query: (searchQuery) => ({
        url: 'prediction/search',
        params: { q: searchQuery },
      }),
    }),
    getPredictions: builder.query<EntityStateWithTotal<IPrediction>, PaginatedArg>({
      query: (params) => ({
        url: 'prediction',
        params,
      }),
      transformResponse: (response: PaginatedResponse<IPrediction>) => {
        return {
          ...predictionAdapter.setAll(predictionAdapter.getInitialState(), response.data ?? []),
          total: response.total ?? 0,
        }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ tag: queryArgs?.tag }),
      merge: (currentCache, newItems, { arg }) => {
        if (arg?.offset === 0) {
          currentCache.entities = newItems.entities
          currentCache.ids = newItems.ids
        } else {
          predictionAdapter.addMany(currentCache, predictionSelectors.selectAll(newItems))
        }
        if (currentCache.total !== newItems.total) currentCache.total = newItems.total
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.offset !== previousArg?.offset || currentArg?.tag !== previousArg?.tag
      },
    }),
    getPrediction: builder.query<IPredictionDetail, number>({
      query: (id) => `prediction/${id}`,
    }),
    getBets: builder.query<EntityStateWithTotal<IPredictionBet>, PaginatedArg>({
      query: ({ id, ...rest }) => ({
        url: `prediction/${id}/bets`,
        params: rest,
      }),
      transformResponse: (response: PaginatedResponse<IPredictionBet>) => {
        return { ...betAdapter.setAll(betAdapter.getInitialState(), response.data ?? []), total: response.total ?? 0 }
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

        const handleCreated = (bet: IPredictionBet) => {
          updateCachedData((draft) => {
            betAdapter.addOne(draft, bet)
          })
        }

        wsManager.subscribe('bet.created', handleCreated)
        await cacheEntryRemoved
        wsManager.unsubscribe('bet.created', handleCreated)
      },
    }),
    getTop: builder.query<EntityStateWithTotal<ITopHolder, string>, PaginatedArg>({
      query: ({ id, ...rest }) => ({
        url: `prediction/${id}/top`,
        params: rest,
      }),
      transformResponse: (response: PaginatedResponse<ITopHolder>) => {
        return { ...topAdapter.setAll(topAdapter.getInitialState(), response.data ?? []), total: response.total ?? 0 }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ id: queryArgs.id }),
      merge: (currentCache, newItems) => {
        if (currentCache.total !== newItems.total) currentCache.total = newItems.total
        topAdapter.addMany(currentCache, topSelectors.selectAll(newItems))
      },
    }),
    getUserPredictions: builder.query<EntityStateWithTotal<IUserPrediction>, PaginatedArg>({
      query: ({ id, ...params }) => ({
        url: `user/${id}/predictions`,
        params,
      }),
      transformResponse: (response: PaginatedResponse<IUserPrediction>) => {
        return {
          ...userPredictionAdapter.setAll(userPredictionAdapter.getInitialState(), response.data ?? []),
          total: response.total ?? 0,
        }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ id: queryArgs.id }),
      merge: (currentCache, newItems) => {
        if (currentCache.total !== newItems.total) currentCache.total = newItems.total
        userPredictionAdapter.addMany(currentCache, userPredictionSelectors.selectAll(newItems))
      },
      forceRefetch({ currentArg, previousArg }) {
        return !!currentArg?.offset && currentArg?.offset !== previousArg?.offset
      },
    }),
    getUserBets: builder.query<EntityStateWithTotal<IUserBet>, PaginatedArg>({
      query: ({ id, ...params }) => ({
        url: `user/${id}/bets`,
        params,
      }),
      transformResponse: (response: PaginatedResponse<IUserBet>) => {
        return {
          ...userBetAdapter.setAll(userBetAdapter.getInitialState(), response.data ?? []),
          total: response.total ?? 0,
        }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ id: queryArgs.id }),
      merge: (currentCache, newItems) => {
        if (currentCache.total !== newItems.total) currentCache.total = newItems.total
        userBetAdapter.addMany(currentCache, userBetSelectors.selectAll(newItems))
      },
      forceRefetch({ currentArg, previousArg }) {
        return !!currentArg?.offset && currentArg?.offset !== previousArg?.offset
      },
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }

        const handleCreated = (bet: IUserBet) => {
          updateCachedData((draft) => {
            userBetAdapter.addOne(draft, bet)
          })
        }

        wsManager.subscribe('user.bet.created', handleCreated)
        await cacheEntryRemoved
        wsManager.unsubscribe('user.bet.created', handleCreated)
      },
    }),
    getLeaderboard: builder.query<EntityStateWithTotal<ILeaderboardUser>, PaginatedArg>({
      query: (params) => ({
        url: 'user/leaderboard',
        params,
      }),
      transformResponse: (response: PaginatedResponse<ILeaderboardUser>) => {
        return {
          ...leaderboardAdapter.setAll(leaderboardAdapter.getInitialState(), response.data ?? []),
          total: response.total ?? 0,
        }
      },
      serializeQueryArgs: ({ queryArgs }) => ({ tag: queryArgs.tag, period: queryArgs.period }),
      merge: (currentCache, newItems) => {
        if (currentCache.total !== newItems.total) currentCache.total = newItems.total
        leaderboardAdapter.addMany(currentCache, leaderboardSelectors.selectAll(newItems))
      },
      forceRefetch({ currentArg, previousArg }) {
        return !!currentArg?.offset && currentArg?.offset !== previousArg?.offset
      },
    }),
    getTopWins: builder.query<ITopWin[], PaginatedArg>({
      query: (params) => ({
        url: 'user/top',
        params,
      }),
    }),
  }),
})

export const {
  useGetConfigQuery,
  useDepositMutation,
  // Auth
  useW3nonceMutation,
  useW3authMutation,
  useEmailNonceMutation,
  useEmailAuthMutation,
  // User
  useGetUserQuery,
  useEmailApproveMutation,
  useSingOutMutation,
  useSetEmailMutation,
  useSetUserParamsMutation,
  useSetAvatarMutation,
  useGetTelegramNonceMutation,
  useGetUserByIdQuery,
  // Notifications
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
  // ------
  useCreateRequestMutation,
  useCreateBetMutation,
  useGetBetsQuery,
  useGetTopQuery,
  useGetTxQuery,
  // ------
  useGetRequestsQuery,
  useGetPredictionsQuery,
  useSearchPredictionsMutation,
  useGetPredictionQuery,
  useGetUserPredictionsQuery,
  useGetUserBetsQuery,
  useGetLeaderboardQuery,
  useGetTopWinsQuery,
} = apiBase
