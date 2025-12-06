export interface INotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
}

export interface INotificationState {
  notifications: INotification[]
  unreadCount: number
}
