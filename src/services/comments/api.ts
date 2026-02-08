import { apiBase } from '../api'

import type { EntityState } from '@reduxjs/toolkit'
import type { PaginatedResponse, IComment, ICommentCreate, ICommentReport } from '../../types/app.types'
import { commentsAdapter, commentsSelectors } from './adapter'
import { wsManager } from '../websocket'

export const commentsApi = apiBase.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<
      EntityState<IComment, number> & { total: number },
      { id: number; limit?: number; offset?: number }
    >({
      query: ({ id, limit = 10, offset = 0 }) => ({
        url: `prediction/${id}/comments`,
        params: { limit, offset },
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        return { id: queryArgs.id }
      },
      merge: (currentCache, newItems) => {
        if (currentCache.total !== newItems.total) {
          currentCache.total = newItems.total
        }
        commentsAdapter.addMany(currentCache, commentsSelectors.selectAll(newItems))
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.offset !== previousArg?.offset
      },
      transformResponse: (response: PaginatedResponse<IComment>) => {
        return {
          ...commentsAdapter.setAll(commentsAdapter.getInitialState(), response.data),
          total: response.total,
        }
      },
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        try {
          await cacheDataLoaded
        } catch {
          return
        }
        wsManager.predictionJoin(arg.id)

        const handleCreated = (comment: IComment) => {
          updateCachedData((draft) => {
            const exists = draft.ids.includes(comment.id)
            if (!exists) {
              commentsAdapter.addOne(draft, comment)
              if (draft.total !== undefined) draft.total += 1
            }
          })
        }
        const handleUpdated = (comment: IComment) => {
          updateCachedData((draft) => {
            commentsAdapter.upsertOne(draft, comment)
          })
        }
        const handleDeleted = (id: number) => {
          updateCachedData((draft) => {
            commentsAdapter.removeOne(draft, id)
            if (draft.total !== undefined) draft.total -= 1
          })
        }
        const handleLike = (id: number) => {
          updateCachedData((draft) => {
            const comment = draft.entities[id]
            if (comment) commentsAdapter.updateOne(draft, { id, changes: { reactions: (comment.reactions || 0) + 1 } })
          })
        }
        const handleDislike = (id: number) => {
          updateCachedData((draft) => {
            const comment = draft.entities[id]
            if (comment) commentsAdapter.updateOne(draft, { id, changes: { reactions: (comment.reactions || 0) - 1 } })
          })
        }

        wsManager.subscribe('comment.created', handleCreated)
        wsManager.subscribe('comment.updated', handleUpdated)
        wsManager.subscribe('comment.deleted', handleDeleted)
        wsManager.subscribe('comment.like', handleLike)
        wsManager.subscribe('comment.dislike', handleDislike)

        await cacheEntryRemoved

        wsManager.predictionLeave(arg.id)

        wsManager.unsubscribe('comment.created', handleCreated)
        wsManager.unsubscribe('comment.updated', handleUpdated)
        wsManager.unsubscribe('comment.deleted', handleDeleted)
        wsManager.unsubscribe('comment.like', handleLike)
        wsManager.unsubscribe('comment.dislike', handleDislike)
      },
    }),
    createComment: builder.mutation<IComment, ICommentCreate>({
      query: (payload) => ({
        url: `prediction/${payload.prediction}/comments`,
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(
          commentsApi.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            commentsAdapter.addOne(draft, data)
          }),
        )
      },
    }),
    deleteComment: builder.mutation<void, { prediction: number; comment: number }>({
      query: ({ prediction, comment }) => ({
        url: `prediction/${prediction}/comments/${comment}`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          commentsApi.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            commentsAdapter.removeOne(draft, arg.comment)
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    addLike: builder.mutation<void, { prediction: number; comment: number }>({
      query: ({ prediction, comment }) => ({
        url: `prediction/${prediction}/comments/${comment}/like`,
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          commentsApi.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            commentsAdapter.updateOne(draft, {
              id: arg.comment,
              changes: { reactions: draft.entities[arg.comment]!.reactions + 1, is_liked: true },
            })
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    removeLike: builder.mutation<void, { prediction: number; comment: number }>({
      query: ({ prediction, comment }) => ({
        url: `prediction/${prediction}/comments/${comment}/like`,
        method: 'DELETE',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          commentsApi.util.updateQueryData('getComments', { id: arg.prediction }, (draft) => {
            commentsAdapter.updateOne(draft, {
              id: arg.comment,
              changes: { reactions: draft.entities[arg.comment]!.reactions - 1, is_liked: false },
            })
          }),
        )

        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    reportComment: builder.mutation<void, ICommentReport>({
      query: ({ prediction, comment, reason, text }) => ({
        url: `prediction/${prediction}/comments/${comment}/report`,
        method: 'POST',
        body: { reason, text },
      }),
    }),
  }),
})

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useAddLikeMutation,
  useRemoveLikeMutation,
  useReportCommentMutation,
} = commentsApi
