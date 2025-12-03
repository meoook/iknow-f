export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}
