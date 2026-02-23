import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetTxQuery } from '../services/api'
import type { ITx } from '../types/app.types'

export const txAdapter = createEntityAdapter<ITx>({
  sortComparer: (a, b) => b.created - a.created,
})

export const txSelectors = txAdapter.getSelectors()

export const useTxIds = () => {
  return useGetTxQuery(undefined, {
    selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
      txIds: data ? txSelectors.selectIds(data) : [],
      total: data?.total ?? 0,
      isLoading,
      isFetching,
      isError,
    }),
  })
}

export const useTx = (id: number): ITx | undefined => {
  const { data } = useGetTxQuery(undefined)
  return data ? txSelectors.selectById(data, id) : undefined
}
