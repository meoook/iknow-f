import { apiBase } from '../api'

import type { EntityState } from '@reduxjs/toolkit'
import type { PaginatedResponse, IRequest, IRequestCreate, INotification } from '../../types/app.types'
import { requestAdapter, notificationAdapter } from './adapter'
import { wsManager } from '../websocket'

export const userApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<EntityState<INotification, number>, { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) => ({
        url: 'auth/user/notification',
        params: { limit, offset },
      }),
      transformResponse: (response: PaginatedResponse<INotification>) => {
        return notificationAdapter.setAll(notificationAdapter.getInitialState(), response.data)
      },
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
    // Requests
    getRequests: builder.query<EntityState<IRequest, number>, { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) => ({
        url: 'request',
        params: { limit, offset },
      }),
      transformResponse: (response: PaginatedResponse<IRequest>) => {
        return requestAdapter.setAll(requestAdapter.getInitialState(), response.data)
      },
      async onCacheEntryAdded(_arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }

        const handleCreated = (comment: IRequest) => {
          updateCachedData((draft) => {
            requestAdapter.addOne(draft, comment)
          })
        }
        const handleUpdated = (comment: IRequest) => {
          updateCachedData((draft) => {
            requestAdapter.upsertOne(draft, comment)
          })
        }
        const handleDeleted = (id: number) => {
          updateCachedData((draft) => {
            requestAdapter.removeOne(draft, id)
          })
        }

        wsManager.subscribe('request.created', handleCreated)
        wsManager.subscribe('request.updated', handleUpdated)
        wsManager.subscribe('request.deleted', handleDeleted)

        await cacheEntryRemoved

        wsManager.unsubscribe('request.created', handleCreated)
        wsManager.unsubscribe('request.updated', handleUpdated)
        wsManager.unsubscribe('request.deleted', handleDeleted)
      },
    }),
    createRequest: builder.mutation<any, IRequestCreate>({
      query: (payload) => ({
        url: 'request',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(
          userApi.util.updateQueryData('getRequests', {}, (draft) => {
            requestAdapter.addOne(draft, data)
          }),
        )
      },
    }),
  }),
})

export const { useGetRequestsQuery, useCreateRequestMutation } = userApi
