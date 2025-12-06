import type { Middleware } from '@reduxjs/toolkit'
import { wsService } from '../services/websocket'
import { markAsRead, markAllAsRead, removeNotification, clearAllNotifications } from './notification.slice'

export const websocketMiddleware: Middleware = () => (next) => (action) => {
  // First, pass the action to the next middleware/reducer
  const result = next(action)

  // Then send WebSocket commands based on the action
  if (markAsRead.match(action)) {
    wsService.sendMarkAsRead(action.payload)
  } else if (markAllAsRead.match(action)) {
    wsService.sendMarkAllAsRead()
  } else if (removeNotification.match(action)) {
    wsService.sendRemoveNotification(action.payload)
  } else if (clearAllNotifications.match(action)) {
    wsService.sendClearAllNotifications()
  }

  return result
}
