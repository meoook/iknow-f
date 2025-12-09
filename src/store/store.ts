import { configureStore } from '@reduxjs/toolkit'
import { api } from '../services/api'
import authReducer from './auth.slice'
import notificationReducer from './notification.slice'
import { websocketMiddleware } from './websocketMiddleware'
import { authMiddleware } from './authMiddleware'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, websocketMiddleware, authMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
