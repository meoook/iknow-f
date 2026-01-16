import type { ICurrency } from "./auth.types"

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

export type TVote = 'yes' | 'no'

export interface IRequestCreate {
  title: string
  rules: string
  choices: string[]
  vote_choice: string
  vote: TVote
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

export interface IPrediction {
  id: number
  title: string
  group: string
  icon: string
  volume: number
  bet_diff: number
  end_date: string
}

export interface IPredictionDetail {
  // 'id', 'title', 'group', 'icon', 'volume', 'bet_diff', 'end_date'
  id: number
  title: string
  description: string
  tag: string
  icon: string
}

export interface IChoice {
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

interface IBetChoice {
  id: number
  volume_y: number
  volume_n: number
  bet_diff: number
  title: string
  result: boolean | null
  prediction_end_date: string
  prediction_title: string
  prediction_group: string
  prediction_icon: string
}

export interface IBet {
  id: number
  state: 'ACTIVE' | 'WIN' | 'LOSE' | 'CANCEL'
  vote: TVote
  currency: ICurrency
  amount: number
  created: string
  choice: IBetChoice
}
