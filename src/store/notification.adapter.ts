import { createEntityAdapter } from '@reduxjs/toolkit'
import type { INotification } from '../types/app.types'
import type { RootState } from './store'
import { useAppSelector } from '../hooks/useRedux'

export const notificationAdapter = createEntityAdapter<INotification>({
  sortComparer: (a, b) => b.created - a.created,
})

export const notificationSelectors = notificationAdapter.getSelectors((state: RootState) => state.app.notifications)

export const useNotificationIds = () => useAppSelector(notificationSelectors.selectIds)

export const useNotification = (id: number) => {
  return useAppSelector((state) => notificationSelectors.selectById(state, id))
}

export const useUnreadCount = () => {
  return useAppSelector((state) => {
    const notifications = notificationSelectors.selectAll(state)
    return notifications.filter((n) => !n.read).length
  })
}
