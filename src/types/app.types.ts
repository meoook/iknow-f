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

export interface PaginatedResponse<T> {
  total: number
  data: T[]
}

export type TVote = 'yes' | 'no'

export interface IRequestCreate {
  title: string
  rules: string
  choices: string[]
  vote_choice: string
  vote: TVote
  currency: string
  amount: string
  end_date: string
}

export interface IRequest {
  id: number
  state: string
  reject_reason: string
  tag: string
  title: string
  rules: string
  choices: string[]
  vote_choice: string
  vote: boolean
  amount: string
  end_date: string
}

export interface IGroup {
  id: number
  title: string
  description: string
  tag: string
  icon: string
}

export interface IPrediction {
  id: number
  state: string
  volume_y: number
  volume_n: number
  bet_diff: number
  result: string
  title: string
  description: string
  end_date: string
  group_title: string
  group_tag: string
  group_icon: string
}

export interface IBet {
  id: number
  state: string
  vote: TVote
  amount: string
  created: string
}
