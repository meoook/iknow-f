import type { Middleware } from '@reduxjs/toolkit'
import { apiBase } from '../services/api'
import { wsManager } from '../services/websocket'
import { getCookie } from '../utils/date'

/**
 * Middleware для автоматической загрузки данных пользователя:
 * 1. При инициализации приложения (если кука authed=1)
 * 2. После успешной аутентификации (w3auth или signIn)
 */
export const authMiddleware: Middleware = (store) => {
  // Инициализация: загружаем пользователя при старте приложения
  setTimeout(() => {
    const state = store.getState() as any

    if (getCookie('authed') === '1' && !state.auth.user) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(apiBase.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    } else {
      wsManager.connect()
    }
  }, 0)

  // Основная функция middleware - реагирует на actions
  return (next) => (action) => {
    const result = next(action)

    // После успешной аутентификации автоматически загружаем пользователя
    if (apiBase.endpoints.w3auth.matchFulfilled(action) || apiBase.endpoints.emailAuth.matchFulfilled(action)) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(apiBase.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }

    // Загружаем уведомления и подключаем/переподключаем сокет после успешного получения данных пользователя
    if (apiBase.endpoints.getUser.matchFulfilled(action)) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(apiBase.endpoints.getNotifications.initiate(undefined, { forceRefetch: true }))
      wsManager.reconnect()
    }

    // Логаут в сокете при выходе
    if (apiBase.endpoints.singOut.matchFulfilled(action)) wsManager.logout()

    // Подключаемся к сокету при ошибке получения пользователя
    if (apiBase.endpoints.getUser.matchRejected(action)) wsManager.connect()

    return result
  }
}
