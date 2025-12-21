import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IAppState, INotification } from '../types/app.types'

// Функция для определения начальной темы
const getInitialTheme = (): 'light' | 'dark' => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialState: IAppState = {
  theme: getInitialTheme(),
  notifications: [],
  unreadCount: 0,
}

// Применяем тему к CSS переменным
const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement
  if (theme === 'light') {
    root.style.setProperty('--color-primary', '#222')
    root.style.setProperty('--color-secondary', '#555')
    root.style.setProperty('--color-body', '#fff')
    root.style.setProperty('--color-head', '#fff')
    root.style.setProperty('--color-dialog', '#fff')
    root.style.setProperty('--color-input', '#fff')
    root.style.setProperty('--color-active', '#ddd')
    root.style.setProperty('--color-hover', '#eee')
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
      state.notifications.unshift(action.payload)
      if (!action.payload.read) state.unreadCount += 1
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.notifications.splice(index, 1)
      }
    },
    clearAllNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
  },
})

export const { toggleTheme, addNotification, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } =
  appSlice.actions

export default appSlice.reducer
