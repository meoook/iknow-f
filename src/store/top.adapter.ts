import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetTopQuery } from '../services/api'
import type { ITopHolder } from '../types/app.types'

export const topAdapter = createEntityAdapter<ITopHolder, string>({
  sortComparer: (a, b) => b.total - a.total,
  selectId: (entity) => entity.username,
})

export const topSelectors = topAdapter.getSelectors()

export const useTopIds = (predictionId: number) => {
  return useGetTopQuery(
    { id: predictionId },
    {
      skip: !predictionId,
      selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
        topIds: data ? topSelectors.selectIds(data) : [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
      }),
    },
  )
}

export const useTop = (predictionId: number, username: string): ITopHolder | undefined => {
  const { data } = useGetTopQuery({ id: predictionId }, { skip: !predictionId })
  return data ? topSelectors.selectById(data, username) : undefined
}
