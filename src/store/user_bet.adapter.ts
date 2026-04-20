import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetUserBetsQuery } from '../services/api'
import type { IUserBet } from '../types/app.types'

export const userBetAdapter = createEntityAdapter<IUserBet>({
  sortComparer: (a, b) => b.created - a.created,
})
export const userBetSelectors = userBetAdapter.getSelectors()

export const useUserBets = (userId: number | string, limit?: number, offset?: number) => {
  return useGetUserBetsQuery(
    { id: userId, limit, offset },
    {
      skip: !userId,
      selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
        betIds: data ? userBetSelectors.selectIds(data) : [],
        bets: data ? userBetSelectors.selectAll(data) : [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
      }),
    },
  )
}
