import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetRequestsQuery } from '../services/api'
import type { IRequest } from '../types/app.types'

export const requestsAdapter = createEntityAdapter<IRequest>({
  sortComparer: (a, b) => b.created - a.created,
})

export const requestsSelectors = requestsAdapter.getSelectors()

export const useRequestIds = () => {
  return useGetRequestsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
      requestIds: data ? requestsSelectors.selectIds(data) : [],
      total: data?.total ?? 0,
      isLoading,
      isFetching,
      isError,
    }),
  })
}

export const useRequest = (id: number): IRequest | undefined => {
  const { data } = useGetRequestsQuery(undefined)
  return data ? requestsSelectors.selectById(data, id) : undefined
}
