import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IAuthState, IBalanceUpdate } from '../types/auth.types'
import { api } from '../services/api'

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
  },
  extraReducers: (builder) => {
    // Handle login mutations from RTK Query
    builder
      .addMatcher(api.endpoints.w3auth.matchFulfilled, (state, action) => {
        state.token = action.payload.token
        // state.loading = false
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload.token)
      })
      .addMatcher(api.endpoints.w3auth.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(api.endpoints.emailAuth.matchFulfilled, (state, action) => {
        state.token = action.payload.token
        // state.loading = false
        localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, action.payload.token)
      })
      .addMatcher(api.endpoints.emailAuth.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(api.endpoints.singOut.matchFulfilled, (state) => {
        state.token = null
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
      .addMatcher(api.endpoints.getUser.matchFulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addMatcher(api.endpoints.getUser.matchRejected, (state) => {
        state.token = null
        state.loading = false
        state.user = null
        localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      })
  },
})

export const { setLoading, setBalance } = authSlice.actions
export default authSlice.reducer
