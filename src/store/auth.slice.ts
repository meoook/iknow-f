import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IAuthState, IUser } from '../types/auth.types'
import { apiBase } from '../services/api'
import { getCookie } from '../utils/date'

const initialState: IAuthState = {
  loading: getCookie('authed') === '1',
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setBalance: (state, action: PayloadAction<number>) => {
      if (state.user) state.user.balance = action.payload
    },
    updateUser: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) Object.assign(state.user, action.payload)
    },
    clearUser: (state) => {
      state.user = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    // Handle login mutations from RTK Query
    builder
      .addMatcher(apiBase.endpoints.w3auth.matchFulfilled, (state, action) => {
        state.user = action.payload.user
        state.loading = false
      })
      .addMatcher(apiBase.endpoints.w3auth.matchRejected, (state) => {
        state.loading = false
        state.user = null
      })
      .addMatcher(apiBase.endpoints.emailAuth.matchFulfilled, (state, action) => {
        state.user = action.payload.user
        state.loading = false
      })
      .addMatcher(apiBase.endpoints.emailAuth.matchRejected, (state) => {
        state.loading = false
        state.user = null
      })
      .addMatcher(apiBase.endpoints.singOut.matchFulfilled, (state) => {
        state.user = null
      })
      .addMatcher(apiBase.endpoints.getUser.matchFulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addMatcher(apiBase.endpoints.getUser.matchRejected, (state) => {
        state.loading = false
        state.user = null
      })
      .addMatcher(apiBase.endpoints.setEmail.matchFulfilled, (state, action) => {
        if (state.user && action.payload.email) state.user.email = action.payload.email
      })
      .addMatcher(apiBase.endpoints.setUserParams.matchFulfilled, (state, action) => {
        if (state.user) Object.assign(state.user, action.payload)
      })
      .addMatcher(apiBase.endpoints.setAvatar.matchFulfilled, (state, action) => {
        if (state.user) Object.assign(state.user, action.payload)
      })
  },
})

export const { setLoading, setBalance, updateUser, clearUser } = authSlice.actions
export default authSlice.reducer
