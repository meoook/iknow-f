import type { Middleware } from '@reduxjs/toolkit'
import { api } from '../services/api'

/**
 * Middleware для автоматического вызова getUser после успешной аутентификации
 */
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)

  // Проверяем, что это успешная аутентификация через w3auth или signIn
  if (api.endpoints.w3auth.matchFulfilled(action) || api.endpoints.signIn.matchFulfilled(action)) {
    // Автоматически запускаем запрос getUser с форсированием обновления
    // forceRefetch: true игнорирует кэш и всегда делает новый запрос
    // @ts-ignore - RTK Query dispatch type mismatch
    store.dispatch(api.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
  }

  return result
}
