import { configureStore } from '@reduxjs/toolkit'
import { apiBase } from '../services/api'
import authReducer from './auth.slice'
import appReducer from './app.slice'
import { authMiddleware } from './authMiddleware'

export const store = configureStore({
  reducer: {
    [apiBase.reducerPath]: apiBase.reducer,
    auth: authReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiBase.middleware, authMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
