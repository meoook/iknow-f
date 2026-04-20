import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetBetsQuery } from '../services/api'
import type { IBet } from '../types/app.types'

export const betAdapter = createEntityAdapter<IBet>({
  sortComparer: (a, b) => b.created - a.created,
})

export const betSelectors = betAdapter.getSelectors()

export const useBetIds = (predictionId: number) => {
  return useGetBetsQuery(
    { id: predictionId },
    {
      skip: !predictionId,
      selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
        betIds: data ? betSelectors.selectIds(data) : [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
      }),
    },
  )
}

export const useBet = (predictionId: number, id: number): IBet | undefined => {
  const { data } = useGetBetsQuery({ id: predictionId }, { skip: !predictionId })
  return data ? betSelectors.selectById(data, id) : undefined
}
