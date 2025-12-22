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

export type TVote = 'yes' | 'no'

export interface IPredictionRequest {
  title: string
  description: string
  vote: TVote
  end_date: string
  currency: string
  amount: string
}
