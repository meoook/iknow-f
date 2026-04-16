import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetLeaderboardQuery } from '../services/api'
import type { ILeaderboardUser } from '../types/app.types'

export const leaderboardAdapter = createEntityAdapter<ILeaderboardUser>()
export const leaderboardSelectors = leaderboardAdapter.getSelectors()

export const useLeaderboard = (tag?: string, period?: string, limit?: number, offset?: number) => {
  return useGetLeaderboardQuery(
    { tag, period, limit, offset },
    {
      selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
        userIds: data ? leaderboardSelectors.selectIds(data) : [],
        users: data ? leaderboardSelectors.selectAll(data) : [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
      }),
    },
  )
}
