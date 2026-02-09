import { createEntityAdapter } from '@reduxjs/toolkit'
import type { INotification } from '../types/app.types'
import type { RootState } from './store'
import { useAppSelector } from '../hooks/useRedux'

export const notificationAdapter = createEntityAdapter<INotification>({
  sortComparer: (a, b) => b.created - a.created,
})

export const notificationSelectors = notificationAdapter.getSelectors((state: RootState) => state.app.notifications)

export const useNotificationIds = () => useAppSelector(notificationSelectors.selectIds)

export const useNotification = (id: number): INotification | undefined => {
  return useAppSelector((state) => notificationSelectors.selectById(state, id))
}

export const useUnreadCount = () => {
  const notifications = useAppSelector(notificationSelectors.selectAll)
  return notifications.filter((n) => !n.read).length
}
