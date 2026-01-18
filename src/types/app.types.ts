import type { ICurrency } from './auth.types'

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
  notifications: INotification[]
  unreadCount: number
}

export interface PaginatedResponse<T> {
  total: number
  data: T[]
}

export interface IRequestCreate {
  title: string
  rules: string
  choices: string[]
  vote_choice: string
  vote: boolean
  currency: string
  amount: number
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
  currency: 'POINT' | 'CASH'
  amount: number
  end_date: string
}

const TPredictionState = {
  NEW: 'NEW',
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
  bet_diff: number
  end_date: string
}

export interface IChoice {
  id: number
  title: string
  volume_y: number
  volume_n: number
  bet_diff: number
  result: boolean
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

export interface IBet {
  id: number
  state: 'ACTIVE' | 'WIN' | 'LOSE' | 'CANCEL'
  vote: boolean
  currency: ICurrency
  amount: number
  win: number
  created: string
  choice: IBetChoice
}
