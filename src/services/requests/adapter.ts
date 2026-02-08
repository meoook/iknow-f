import { createEntityAdapter } from '@reduxjs/toolkit'
import { apiBase } from '../api'
import type { IRequest } from '../../types/app.types'

export const requestsAdapter = createEntityAdapter<IRequest>({
  sortComparer: (a, b) => b.created - a.created,
})

export const requestsSelectors = requestsAdapter.getSelectors()

export const useRequests = () => {
  return apiBase.endpoints.getRequests.useQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError }) => ({
      requests: data ? requestsSelectors.selectAll(data) : [],
      isLoading,
      isError,
    }),
  })
}
