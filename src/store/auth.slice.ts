import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IAuthState, IAuthResponse } from '../types/auth.types'
import { api } from '../services/api'

export const LOCAL_STORAGE_TOKEN_KEY: string = 'token'

const initialState: IAuthState = {
  token: localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY),
  loading: false,
  error: null,
  isAuthenticated: false, //!!localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<IAuthResponse>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload.token)
    },
  },
  extraReducers: (builder) => {
    // Handle login mutations from RTK Query
    builder
      .addMatcher(api.endpoints.w3auth.matchFulfilled, (state, action) => {
        state.token = action.payload
        state.loading = false
        state.isAuthenticated = true
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload)
      })
      .addMatcher(api.endpoints.w3auth.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(api.endpoints.signIn.matchFulfilled, (state, action) => {
        state.token = action.payload
        state.loading = false
        state.isAuthenticated = true
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload)
      })
      .addMatcher(api.endpoints.singOut.matchFulfilled, (state) => {
        state.token = null
        state.isAuthenticated = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(api.endpoints.getUser.matchFulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addMatcher(api.endpoints.getUser.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
  },
})

export const { setLoading, setToken, logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer
