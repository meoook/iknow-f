import { configureStore } from '@reduxjs/toolkit'
import { api } from '../services/api'
import authReducer from './auth.slice'
import appReducer from './app.slice'
import { authMiddleware } from './authMiddleware'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, authMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
