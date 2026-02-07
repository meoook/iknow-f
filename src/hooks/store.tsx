import { useGetCommentsQuery, commentsAdapter } from '../services/api'

export const useComments = (id: number) => {
  return useGetCommentsQuery(
    { id },
    {
      selectFromResult: ({ data, isLoading }) => ({
        comments: data ? commentsAdapter.getSelectors().selectAll(data) : [],
        isLoading,
      }),
    },
  )
}
