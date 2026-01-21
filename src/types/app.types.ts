import type { TCurrency } from './auth.types'

export interface IConfig {
  diff: number
  fee: number
}

export interface INotification {
  id: number
  read: boolean
  alert_type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  title: string
  text: string
  created: string
}

export interface IAppState {
  theme: 'light' | 'dark'
  config: IConfig
  notifications: INotification[]
  unreadCount: number
}

export interface PaginatedResponse<T> {
  total: number
  data: T[]
}

export interface IRequestCreate {
  icon?: File
  title: string
  rules: string
  choices: string[]
  vote: string
  currency: TCurrency
  amount: number
  end_date: string
}

export interface IRequest {
  id: number
  state: string
  reject_reason: string
  tag: string
  icon?: string
  title: string
  rules: string
  choices: string[]
  vote_choice: string
  vote: boolean
  currency: TCurrency
  amount: number
  end_date: string
}

const TPredictionState = {
  ACTIVE: 'ACTIVE',
  DISPUTE: 'DISPUTE',
  ENDED: 'ENDED',
  REJECTED: 'REJECTED',
} as const

export type TPredictionState = (typeof TPredictionState)[keyof typeof TPredictionState]

export interface IPrediction {
  id: number
  state: TPredictionState
  title: string
  group: string
  icon: string
  volume: number
  diff: number
  end_date: string
}

export interface IChoice {
  id: number
  title: string
  volume: number
  diff: number
  win: boolean | null
}

export interface IPredictionDetail {
  id: number
  state: TPredictionState
  title: string
  group: string
  icon: string
  volume: number
  bet_diff: number
  end_date: string
  rules: string
  closed: string
  created: string
  choices: IChoice[]
}

interface IBetChoice {
  volume_y: number
  volume_n: number
  bet_diff: number
  title: string
  result: boolean | null
  prediction_id: number
  prediction_title: string
  prediction_group: string
  prediction_icon: string
  prediction_end_date: string
}

export interface IMyBet {
  id: number
  state: 'ACTIVE' | 'WIN' | 'LOSE' | 'CANCEL'
  vote: boolean
  currency: TCurrency
  amount: number
  win: number
  created: string
  choice: IBetChoice
}

export interface IBetCreate {
  choice_id: number
  currency: TCurrency
  amount: number
}

export interface IBet {
  id: number
  username: string
  avatar: string
  currency: TCurrency
  amount: number
  title: string
  created: string
}

export interface IComment {
  id: number
  text: string
  username: string
  avatar: string
  likes: number
  created: string
}

export interface ICommentCreate {
  prediction: number
  text: string
}
