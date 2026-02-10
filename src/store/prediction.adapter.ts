import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetPredictionsQuery } from '../services/api'
import type { IPrediction } from '../types/app.types'

export const predictionAdapter = createEntityAdapter<IPrediction>({
  sortComparer: (a, b) => b.created - a.created,
})

export const predictionSelectors = predictionAdapter.getSelectors()

export const usePredictionIds = () => {
  return useGetPredictionsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
      predictionIds: data ? predictionSelectors.selectIds(data) : [],
      total: data?.total ?? 0,
      isLoading,
      isFetching,
      isError,
    }),
  })
}

export const usePrediction = (id: number): IPrediction | undefined => {
  const { data } = useGetPredictionsQuery(undefined)
  return data ? predictionSelectors.selectById(data, id) : undefined
}
