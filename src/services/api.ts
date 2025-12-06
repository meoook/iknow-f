import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { config } from '../config/config'
import type { IUser, ILoginCredentials, IAuthResponse } from '../types/auth.types'
import type { Web3Message } from '../types/web3.types'
import { setLoading } from '../store/auth.slice'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['User', 'Requests', 'Predictions', 'Bets', 'Groups'],
  endpoints: (builder) => ({
    // Web3 endpoints
    w3nonce: builder.mutation<Web3Message, { chain: number; address: string }>({
      query: ({ chain, address }) => ({
        url: 'auth/web3',
        params: { chain, address },
      }),
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
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(setLoading(true))
        await queryFulfilled
        // try {
        //   const { data: token } = await queryFulfilled
        //   dispatch(setToken(token))
        // } catch (error) {
        //   dispatch(setLoading(false))
        // }
      },
    }),
    signIn: builder.mutation<string, { email: string; password: string }>({
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
        // try {
        //   const { data: token } = await queryFulfilled
        //   dispatch(setToken(token))
        // } catch (error) {
        //   dispatch(setLoading(false))
        // }
      },
    }),
    singOut: builder.mutation<void, void>({
      invalidatesTags: ['User'],
      query: () => ({
        url: 'auth/user',
        method: 'DELETE',
      }),
    }),
    // Auth endpoints
    loginWithPassword: builder.mutation<IAuthResponse, ILoginCredentials>({
      query: (credentials) => ({
        url: 'auth/user/password',
        method: 'POST',
        body: credentials,
      }),
    }),
    loginWithWeb3: builder.mutation<IAuthResponse, { walletAddress: string; signature: string; message: string }>({
      query: (payload) => ({
        url: 'auth/web3',
        method: 'POST',
        body: payload,
      }),
    }),
    loginWithEmail: builder.mutation<IAuthResponse, { email: string }>({
      query: (payload) => ({
        url: 'auth/user/email',
        method: 'POST',
        body: payload,
      }),
    }),
    loginWithTelegram: builder.mutation<IAuthResponse, any>({
      query: (payload) => ({
        url: 'auth/user/telegram',
        method: 'POST',
        body: payload,
      }),
    }),
    getUser: builder.query<IUser, void>({
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
