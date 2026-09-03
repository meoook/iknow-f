import type { EntityId, EntityState } from '@reduxjs/toolkit'

export type EntityStateWithTotal<T, Id extends EntityId = number> = EntityState<T, Id> & { total: number }

export type PaginatedArg = {
  id?: number | string
  limit?: number
  offset?: number
  group?: string
  sort?: string
  period?: string
}

export interface ISettings {
  // fee: number
  min_bet: number
  min_create: number
  delete: number  // comment delete hours limit
  limit: number  // years limit to end prediction
}

export interface INotification {
  id: number
  read: boolean
  alert_type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  title: string
  text: string
  created: number
}

export interface IAppState {
  theme: 'light' | 'dark'
  settings: ISettings
  notifications: EntityState<INotification, number>
}

export interface PaginatedResponse<T> {
  total: number
  data: T[]
}

export interface IRequestCreate {
  icon?: File
  title: string
  rules: string
  link: string
  choices: string[]
  vote: string
  amount: number
  end_date: string
  bet_date: string
}

export interface IRequest {
  id: number
  state: string
  reject_reason: string
  groups: string[]
  icon?: string | null
  title: string
  rules: string
  link: string
  choices: string[]
  vote: string
  amount: number
  end_date: string
  bet_date: string
  created: number
}

export const TPredictionState = {
  ACTIVE: 'ACTIVE',
  END_BET: 'END_BET',
  DISPUTE: 'DISPUTE',
  ENDED: 'ENDED',
  REJECTED: 'REJECTED',
} as const

export type TPredictionState = (typeof TPredictionState)[keyof typeof TPredictionState]


export interface IChoice {
  id: number
  title: string
  volume: number
  multiplier: number
  win: boolean | null
}

export interface IPrediction {
  id: number
  choices: IChoice[]
  state: TPredictionState
  icon: string | null
  title: string
  // groups: string[] // TODO: Needed?
  volume: number
  end_date: string
  bet_date: string
  created: number
  hot: boolean
}

export interface IPredictionDetail extends IPrediction {
  groups: string[]
  rules: string
  link: string
  closed: string | null
}

export interface IHistoryPoint<V = number | Record<string, number>> {
  t: number
  v: V
}

export interface IPredictionSearch {
  id: number
  title: string
  icon: string | null
  volume: number
}

export interface IUserPrediction {
  id: number
  title: string
  icon: string | null
  volume: number
  // created: number
  amount: number
  payout: number
}

interface IUserBetPrediction {
  id: number
  title: string
  icon: string | null
}

export interface IUserBet {
  id: number
  amount: number
  created: number
  choice: string
  prediction: IUserBetPrediction
}

export interface IBetCreate {
  prediction_id: number
  choice_id: number
  amount: number
}

interface IObjectUser {
  id: number
  username: string
  avatar: string | null
}

export interface IPredictionBet {
  id: number
  amount: number
  created: number
  choice: string
  user: IObjectUser
}

export interface ITopHolder {
  id: number
  username: string
  avatar: string | null
  total: number
}

export interface IComment {
  id: number
  text: string
  reactions: number
  is_liked: boolean
  owner: boolean
  created: number
  user: IObjectUser
}

export interface ICommentCreate {
  prediction: number
  text: string
}

export interface ICommentReport {
  predictionId: number
  commentId: number
  reason: string
  text: string
}

export interface ITx {
  id: number
  direction: 'IN' | 'OUT'
  amount: number
  created: number
}

export interface ILeaderboardUser {
  id: number
  username: string
  avatar: string | null
  amount: number
  payout: number
  profit: number
}

interface ITopWinPrediction {
  id: number
  title: string
}

export interface ITopWin {
  user: IObjectUser
  prediction: ITopWinPrediction
  amount: number
  payout: number
}

export interface IDepositParam {
  currency: string
  minimum: number
  address: string
  chain_name: string
}

export interface IWithdrawPayload {
  chain_name: string
  amount: number
  address: string
}
