import type { Middleware } from '@reduxjs/toolkit'
import { apiBase } from '../services/api'
import { wsManager } from '../services/websocket'

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
      store.dispatch(apiBase.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }
  }, 0)

  // Основная функция middleware - реагирует на actions
  return (next) => (action) => {
    const result = next(action)

    // После успешной аутентификации или инициализации автоматически загружаем пользователя
    if (apiBase.endpoints.w3auth.matchFulfilled(action) || apiBase.endpoints.emailAuth.matchFulfilled(action)) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(apiBase.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }

    // Загружаем уведомления и аутентифицируем сокет после успешного получения данных пользователя
    if (apiBase.endpoints.getUser.matchFulfilled(action)) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(apiBase.endpoints.getNotifications.initiate(undefined, { forceRefetch: true }))

      const state = store.getState() as any
      if (state.auth.token) wsManager.auth(state.auth.token)
    }

    // Отключаем сокет при выходе или ошибке получения пользователя
    if (apiBase.endpoints.singOut.matchFulfilled(action) || apiBase.endpoints.getUser.matchRejected(action)) {
      wsManager.logout()
    }

    return result
  }
}
