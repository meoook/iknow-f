import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetUserPredictionsQuery } from '../services/api'
import type { IUserPrediction } from '../types/app.types'

export const userPredictionAdapter = createEntityAdapter<IUserPrediction>()
export const userPredictionSelectors = userPredictionAdapter.getSelectors()

export const useUserPredictions = (userId: number | string, limit?: number, offset?: number) => {
  return useGetUserPredictionsQuery(
    { id: userId, limit, offset },
    {
      skip: !userId,
      selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
        predictionIds: data ? userPredictionSelectors.selectIds(data) : [],
        predictions: data ? userPredictionSelectors.selectAll(data) : [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
      }),
    },
  )
}
