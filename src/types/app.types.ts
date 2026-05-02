import type { EntityId, EntityState } from '@reduxjs/toolkit'

export type EntityStateWithTotal<T, Id extends EntityId = number> = EntityState<T, Id> & { total: number }

export type PaginatedArg = {
  id?: number | string
  limit?: number
  offset?: number
  tag?: string
  period?: string
}

export interface ISettings {
  multiplier: number
  fee: number
  min_bet: number
  min_create: number
  delete: number
  limit: number
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
  tags: string[]
  icon?: string
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

const TPredictionState = {
  ACTIVE: 'ACTIVE',
  END_BET: 'END_BET',
  DISPUTE: 'DISPUTE',
  ENDED: 'ENDED',
  REJECTED: 'REJECTED',
} as const

export type TPredictionState = (typeof TPredictionState)[keyof typeof TPredictionState]

export interface IPrediction {
  id: number
  state: TPredictionState
  title: string
  tags: string[]
  icon: string
  volume: number
  multiplier: number
  end_date: string
  created: number
}

export interface IChoice {
  id: number
  title: string
  volume: number
  multiplier: number
  win: boolean | null
}

export interface IPredictionDetail {
  id: number
  state: TPredictionState
  title: string
  tags: string[]
  icon: string
  volume: number
  multiplier: number
  end_date: string
  bet_date: string
  rules: string
  link: string
  closed: string
  created: number
  choices: IChoice[]
}

export interface IPredictionSearch {
  id: number
  title: string
  icon: string
  volume: number
}

export interface IUserPrediction {
  id: number
  title: string
  icon: string
  volume: number
  // created: number
  amount: number
  payout: number
}

interface IUserBetPrediction {
  id: number
  title: string
  icon: string
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
  avatar: string
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
  avatar: string
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
  avatar: string
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
