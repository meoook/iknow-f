import { createEntityAdapter } from '@reduxjs/toolkit'
import { useGetCommentsQuery } from './api'
import type { IComment } from '../../types/app.types'

export const commentsAdapter = createEntityAdapter<IComment>({
  sortComparer: (a, b) => b.created - a.created,
})

export const commentsSelectors = commentsAdapter.getSelectors()

export const useCommentIds = (predictionId: number) => {
  return useGetCommentsQuery(
    { id: predictionId },
    {
      selectFromResult: ({ data, isLoading, isFetching, isError }) => ({
        commentIds: data ? commentsSelectors.selectIds(data) : [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
        isError,
      }),
    },
  )
}

export const useComment = (predictionId: number, id: number): IComment | undefined => {
  const { data } = useGetCommentsQuery({ id: predictionId })
  return data ? commentsSelectors.selectById(data, id) : undefined
}
