import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetMyBetsQuery } from '../services/api'
import type { IMyBet } from '../types/app.types'

export const mybetAdapter = createEntityAdapter<IMyBet>({
  sortComparer: (a, b) => b.created - a.created,
})

export const mybetSelectors = mybetAdapter.getSelectors()

export const useMybetIds = () => {
  return useGetMyBetsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
      mybetIds: data ? mybetSelectors.selectIds(data) : [],
      total: data?.total ?? 0,
      isLoading,
      isFetching,
      isError,
    }),
  })
}

export const useMybet = (id: number): IMyBet | undefined => {
  const { data } = useGetMyBetsQuery(undefined)
  return data ? mybetSelectors.selectById(data, id) : undefined
}
