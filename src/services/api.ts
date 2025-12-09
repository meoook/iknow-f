import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from '../config/config'
import type { IUser, ILoginCredentials, IAuthResponse } from '../types/auth.types'
import type { Web3MessageNonce } from '../types/web3.types'
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
    w3nonce: builder.mutation<Web3MessageNonce, { chain: number; address: string }>({
      query: ({ chain, address }) => ({
        url: 'auth/web3',
        params: { chain, address },
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        await queryFulfilled
      },
    }),
    w3auth: builder.mutation<string, { message: string; signature: string }>({
      // invalidatesTags: ['User'],
      query: ({ message, signature }) => ({
        url: 'auth/web3',
        method: 'POST',
        body: { message, signature },
      }),
      transformResponse: (response: any) => response.token,
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') return 'server unreacheble'
        return 'invalid signature'
      },
      // async onQueryStarted(_args, { dispatch, queryFulfilled }) {
      //   dispatch(setLoading(true))
      //   await queryFulfilled
      // },
    }),
    signIn: builder.mutation<string, ILoginCredentials>({
      // invalidatesTags: ['User'],
      query: ({ email, password }) => ({
        url: 'auth/user',
        method: 'POST',
        body: { username: email, password },
      }),
      transformResponse: (response: any) => response.token,
      transformErrorResponse: (response: any) => {
        if (response.status === 'FETCH_ERROR') return 'server unreacheble'
        return 'invalid credentials'
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        await queryFulfilled
      },
    }),
    singOut: builder.mutation<void, void>({
      invalidatesTags: ['User'],
      query: () => ({
        url: 'auth/user',
        method: 'DELETE',
      }),
    }),
    getUser: builder.query<IUser, void>({
      query: () => 'auth/user',
      providesTags: ['User'],
    }),
    // User endpoints
    changePassword: builder.mutation<IAuthResponse, { password: string }>({
      query: (payload) => ({
        url: 'auth/user/password',
        method: 'POST',
        body: payload,
      }),
    }),
    loginWithWeb3: builder.mutation<IAuthResponse, { walletAddress: string; signature: string; message: string }>({
      query: (payload) => ({
        url: 'auth/web3',
        method: 'POST',
        body: payload,
      }),
    }),
    setEmail: builder.mutation<IAuthResponse, { email: string }>({
      query: (payload) => ({
        url: 'auth/user/email',
        method: 'POST',
        body: payload,
      }),
    }),
    setTelegram: builder.mutation<IAuthResponse, { nonce: string }>({
      query: (payload) => ({
        url: 'auth/user/telegram',
        method: 'POST',
        body: payload,
      }),
    }),

    // Protected endpoints
    getMyRequests: builder.query<any[], void>({
      query: () => 'my/request',
      providesTags: ['Requests'],
    }),
    getMyPredictions: builder.query<any[], void>({
      query: () => 'my/prediction',
      providesTags: ['Predictions'],
    }),
    getMyBets: builder.query<any[], void>({
      query: () => 'my/bet',
      providesTags: ['Bets'],
    }),

    // Public endpoints
    getGroups: builder.query<any[], void>({
      query: () => 'group',
      providesTags: ['Groups'],
    }),
    searchGroups: builder.query<any[], string>({
      query: (searchQuery) => `group/search?q=${encodeURIComponent(searchQuery)}`,
      providesTags: ['Groups'],
    }),
  }),
})

export const {
  useW3nonceMutation,
  useW3authMutation,
  useSignInMutation,
  useSingOutMutation,
  // ------
  useChangePasswordMutation,
  useLoginWithWeb3Mutation,
  useSetEmailMutation,
  useSetTelegramMutation,
  useGetUserQuery,
  useGetMyRequestsQuery,
  useGetMyPredictionsQuery,
  useGetMyBetsQuery,
  useGetGroupsQuery,
  useSearchGroupsQuery,
} = api
