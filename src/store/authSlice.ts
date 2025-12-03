import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, AuthResponse } from '../types/auth.types'
import { api } from '../services/api'

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('auth_token')
    },
    clearError: (state) => {
      state.error = null
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      localStorage.setItem('auth_token', action.payload.token)
    },
  },
  extraReducers: (builder) => {
    // Handle login mutations from RTK Query
    builder
      .addMatcher(
        api.endpoints.loginWithPassword.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user
          state.token = action.payload.token
          state.isAuthenticated = true
          localStorage.setItem('auth_token', action.payload.token)
        }
      )
      .addMatcher(
        api.endpoints.loginWithWeb3.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user
          state.token = action.payload.token
          state.isAuthenticated = true
          localStorage.setItem('auth_token', action.payload.token)
        }
      )
      .addMatcher(api.endpoints.getUser.matchFulfilled, (state, action) => {
        state.user = action.payload
      })
      .addMatcher(api.endpoints.getUser.matchRejected, (state) => {
        // If fetching user fails, clear auth
        state.isAuthenticated = false
        state.token = null
        state.user = null
        localStorage.removeItem('auth_token')
      })
  },
})

export const { logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer
