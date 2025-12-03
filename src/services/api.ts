import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from '../config/config'
import type { User, LoginCredentials, AuthResponse } from '../types/auth.types'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Requests', 'Predictions', 'Bets', 'Groups'],
  endpoints: (builder) => ({
    // Auth endpoints
    loginWithPassword: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: 'auth/user/password',
        method: 'POST',
        body: credentials,
      }),
    }),
    loginWithWeb3: builder.mutation<
      AuthResponse,
      { walletAddress: string; signature: string; message: string }
    >({
      query: (payload) => ({
        url: 'auth/web3',
        method: 'POST',
        body: payload,
      }),
    }),
    loginWithEmail: builder.mutation<AuthResponse, { email: string }>({
      query: (payload) => ({
        url: 'auth/user/email',
        method: 'POST',
        body: payload,
      }),
    }),
    loginWithTelegram: builder.mutation<AuthResponse, any>({
      query: (payload) => ({
        url: 'auth/user/telegram',
        method: 'POST',
        body: payload,
      }),
    }),
    getUser: builder.query<User, void>({
      query: () => 'auth/user',
      providesTags: ['User'],
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
      query: (searchQuery) =>
        `group/search?q=${encodeURIComponent(searchQuery)}`,
      providesTags: ['Groups'],
    }),
  }),
})

export const {
  useLoginWithPasswordMutation,
  useLoginWithWeb3Mutation,
  useLoginWithEmailMutation,
  useLoginWithTelegramMutation,
  useGetUserQuery,
  useGetMyRequestsQuery,
  useGetMyPredictionsQuery,
  useGetMyBetsQuery,
  useGetGroupsQuery,
  useSearchGroupsQuery,
} = api
