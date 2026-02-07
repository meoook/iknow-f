import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetRequestsQuery } from './api'
import type { IRequest, INotification } from '../../types/app.types'

// Notifications
export const notificationAdapter = createEntityAdapter<INotification>({
  sortComparer: (a, b) => b.created - a.created,
})

// Requests
export const requestAdapter = createEntityAdapter<IRequest>({
  sortComparer: (a, b) => b.created - a.created,
})

export const requestSelectors = requestAdapter.getSelectors()

export const useRequests = () => {
  return useGetRequestsQuery(
    {},
    {
      selectFromResult: ({ data, isLoading }) => ({
        requests: data ? requestSelectors.selectAll(data) : [],
        isLoading,
      }),
    },
  )
}

export const useRequestIds = () => {
  return useGetRequestsQuery(
    {},
    {
      selectFromResult: ({ data, isLoading }) => ({
        requestIds: data?.ids ?? [],
        isLoading,
      }),
    },
  )
}
