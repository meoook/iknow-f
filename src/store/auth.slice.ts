import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IAuthState, IBalanceUpdate, IUser } from '../types/auth.types'
import { apiBase } from '../services/api'

export const LOCAL_STORAGE_TOKEN_KEY: string = 'token'

const initialState: IAuthState = {
  token: localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY),
  loading: !!localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setBalance: (state, action: PayloadAction<IBalanceUpdate>) => {
      if (state.user) state.user.balances[action.payload.currency] = action.payload.amount
    },
    updateUser: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) Object.assign(state.user, action.payload)
    },
  },
  extraReducers: (builder) => {
    // Handle login mutations from RTK Query
    builder
      .addMatcher(apiBase.endpoints.w3auth.matchFulfilled, (state, action) => {
        state.token = action.payload.token
        // state.loading = false
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload.token)
      })
      .addMatcher(apiBase.endpoints.w3auth.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(apiBase.endpoints.emailAuth.matchFulfilled, (state, action) => {
        state.token = action.payload.token
        // state.loading = false
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload.token)
      })
      .addMatcher(apiBase.endpoints.emailAuth.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(apiBase.endpoints.singOut.matchFulfilled, (state) => {
        state.token = null
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(apiBase.endpoints.getUser.matchFulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addMatcher(apiBase.endpoints.getUser.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(apiBase.endpoints.setEmail.matchFulfilled, (state, action) => {
        if (state.user && action.payload.email) state.user.email = action.payload.email
      })
      .addMatcher(apiBase.endpoints.setUserParams.matchFulfilled, (state, action) => {
        if (state.user) Object.assign(state.user, action.payload)
        // if (state.user && action.payload.username) state.user.username = action.payload.username
        // if (state.user && action.payload.email_notify !== undefined) state.user.email_notify = action.payload.email_notify
        // if (state.user && action.payload.telegram_notify !== undefined) state.user.telegram_notify = action.payload.telegram_notify
      })
  },
})

export const { setLoading, setBalance, updateUser } = authSlice.actions
export default authSlice.reducer
