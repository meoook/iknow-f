import type { Middleware } from '@reduxjs/toolkit'
import { apiBase } from '../services/api'
import { wsManager } from '../services/websocket'
import { getCookie } from '../utils/date'
import { clearUser } from './auth.slice'
import type { RootState } from './store'

/**
 * Middleware для управления сессией и WebSocket:
 * 1. Инициализация (загрузка пользователя при старте).
 * 2. Реакция на события входа/выхода.
 * 3. Поллинг куки authed для деавторизации при истечении сессии.
 */
export const authMiddleware: Middleware = (store) => {
  let pollingInterval: ReturnType<typeof setInterval> | null = null

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  const startPolling = () => {
    if (pollingInterval) return

    pollingInterval = setInterval(() => {
      const state = store.getState() as RootState

      // Если пользователя нет в стейте, останавливаем поллинг
      if (!state.auth.user) return stopPolling()

      // Если кука "authed" истекла, сбрасываем состояние
      if (getCookie('authed') !== '1') {
        store.dispatch(clearUser())
        wsManager.logout()
        stopPolling()
      }
    }, 10000)
  }

  // При старте приложения проверяем куку и загружаем данные пользователя
  setTimeout(() => {
    const state = store.getState() as RootState

    if (getCookie('authed') === '1' && !state.auth.user) {
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(apiBase.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    } else {
      wsManager.connect()
      // Если пользователь уже есть (например, из прелоада), запускаем поллинг
      if (state.auth.user) startPolling()
    }
  }, 0)

  return (next) => (action) => {
    const result = next(action)

    // Успешный логин (через Web3 или Email)
    if (apiBase.endpoints.w3auth.matchFulfilled(action) || apiBase.endpoints.emailAuth.matchFulfilled(action)) {
      // @ts-ignore
      store.dispatch(apiBase.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }

    // После успешной загрузки данных пользователя
    if (apiBase.endpoints.getUser.matchFulfilled(action)) {
      // @ts-ignore
      store.dispatch(apiBase.endpoints.getNotifications.initiate(undefined, { forceRefetch: true }))
      wsManager.reconnect()
      startPolling()
    }

    // Обработка выхода
    if (apiBase.endpoints.singOut.matchFulfilled(action)) {
      wsManager.logout()
      stopPolling()
    }

    // Если была ошибка getUser, пробуем просто переподключить WS как гостя
    if (apiBase.endpoints.getUser.matchRejected(action)) wsManager.connect()

    return result
  }
}
