export interface INotification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
}

export interface IAppState {
  theme: 'light' | 'dark'
  notifications: INotification[]
  unreadCount: number
}
