import type { Middleware } from '@reduxjs/toolkit'
import { api } from '../services/api'

/**
 * Middleware для автоматической загрузки данных пользователя:
 * 1. При инициализации приложения (если токен есть в localStorage)
 * 2. После успешной аутентификации (w3auth или signIn)
 */
export const authMiddleware: Middleware = (store) => {
  // Инициализация: проверяем наличие токена при старте приложения
  setTimeout(() => {
    const state = store.getState() as any

    if (state.auth.token && !state.auth.user) {
      // Токен есть (из localStorage), но пользователя нет - загружаем
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(api.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }
  }, 0)

  // Основная функция middleware - реагирует на actions
  return (next) => (action) => {
    const result = next(action)

    // После успешной аутентификации автоматически загружаем пользователя
    if (api.endpoints.w3auth.matchFulfilled(action) || api.endpoints.signIn.matchFulfilled(action)) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(api.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }

    return result
  }
}
