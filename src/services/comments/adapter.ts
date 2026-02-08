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
      selectFromResult: ({ data, isLoading, isFetching }) => ({
        commentIds: data?.ids ?? [],
        total: data?.total ?? 0,
        isLoading,
        isFetching,
      }),
    },
  )
}
