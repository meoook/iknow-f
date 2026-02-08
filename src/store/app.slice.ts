import { createSlice, type PayloadAction, type Update } from '@reduxjs/toolkit'
import type { IAppState, INotification } from '../types/app.types'
import { apiBase } from '../services/api'
import { notificationAdapter } from './notification.adapter'

// Функция для определения начальной темы
const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState: IAppState = {
  theme: getInitialTheme(),
  settings: { multiplier: 0, fee: 0, min_cash: 0, min_point: 0, min_cash_create: 0, min_point_create: 0, delete: 0 },
  notifications: notificationAdapter.getInitialState(),
}

// Применяем тему к CSS переменным
const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  if (theme === 'light') {
    root.style.setProperty('--color-primary', '#222')
    root.style.setProperty('--color-secondary', '#888')
    root.style.setProperty('--color-body', '#fff')
    root.style.setProperty('--color-head', '#fff')
    root.style.setProperty('--color-dialog', '#fff')
    root.style.setProperty('--color-input', '#fff')
    root.style.setProperty('--color-active', '#f0f0f0')
    root.style.setProperty('--color-hover', '#f4f5f6')
  } else {
    root.style.removeProperty('--color-primary')
    root.style.removeProperty('--color-secondary')
    root.style.removeProperty('--color-body')
    root.style.removeProperty('--color-head')
    root.style.removeProperty('--color-dialog')
    root.style.removeProperty('--color-input')
    root.style.removeProperty('--color-active')
    root.style.removeProperty('--color-hover')
  }
}

// Применяем начальную тему
applyTheme(initialState.theme)

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
      applyTheme(state.theme)
    },
    addNotification: (state, action: PayloadAction<INotification>) => {
      notificationAdapter.addOne(state.notifications, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(apiBase.endpoints.getConfig.matchFulfilled, (state, action) => {
      state.settings = action.payload
    })
    builder.addMatcher(apiBase.endpoints.getNotifications.matchFulfilled, (state, action) => {
      notificationAdapter.setAll(state.notifications, action.payload)
    })
    builder.addMatcher(apiBase.endpoints.readNotification.matchFulfilled, (state, action) => {
      notificationAdapter.updateOne(state.notifications, {
        id: action.meta.arg.originalArgs,
        changes: { read: true },
      })
    })
    builder.addMatcher(apiBase.endpoints.readAllNotifications.matchFulfilled, (state) => {
      const updates: Update<INotification, number>[] = state.notifications.ids.map((id) => ({
        id,
        changes: { read: true },
      }))
      notificationAdapter.updateMany(state.notifications, updates)
    })
    builder.addMatcher(apiBase.endpoints.deleteNotification.matchFulfilled, (state, action) => {
      notificationAdapter.removeOne(state.notifications, action.meta.arg.originalArgs)
    })
    builder.addMatcher(apiBase.endpoints.deleteAllNotifications.matchFulfilled, (state) => {
      notificationAdapter.removeAll(state.notifications)
    })
  },
})

export const { toggleTheme, addNotification } = appSlice.actions

export default appSlice.reducer
