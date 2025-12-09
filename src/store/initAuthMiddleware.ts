import type { Middleware } from '@reduxjs/toolkit'
import { api } from '../services/api'

/**
 * Middleware для инициализации аутентификации при старте приложения.
 * Проверяет наличие токена и отсутствие пользователя, затем запрашивает данные.
 */
export const initAuthMiddleware: Middleware = (store) => {
  // Откладываем проверку до следующего тика, чтобы store был полностью инициализирован
  setTimeout(() => {
    const state = store.getState() as any

    if (state.auth.token && !state.auth.user) {
      // Токен есть, но пользователя нет - загружаем
      // @ts-ignore - RTK Query dispatch type mismatch
      store.dispatch(api.endpoints.getUser.initiate(undefined, { forceRefetch: true }))
    }
  }, 0)

  return (next) => (action) => next(action)
}
