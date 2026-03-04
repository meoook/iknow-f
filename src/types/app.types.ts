import type { EntityId, EntityState } from '@reduxjs/toolkit'
import type { TCurrency } from './auth.types'

export interface ISettings {
  multiplier: number
  fee: number
  min_cash: number
  min_point: number
  min_cash_create: number
  min_point_create: number
  delete: number
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

type IPaginatedRequest<RequireId extends boolean = false> = RequireId extends true
  ? {
      id: number
      limit?: number
      offset?: number
      group?: string
    }
  : {
      limit?: number
      offset?: number
      group?: string
    }

export type PaginatedArg<RequireId extends boolean = false> = RequireId extends true
  ? IPaginatedRequest<true>
  : IPaginatedRequest | undefined

export type EntityStateWithTotal<T, Id extends EntityId = number> = EntityState<T, Id> & { total: number }
// interface PaginatedBase {
//   limit?: number
//   offset?: number
// }

// type PaginatedWithId = PaginatedBase & {
//   id: number
// }

// type OptionalQueryArg<T> = T | undefined
// type RequiredQueryArg<T> = T

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
  group: string
  tags: string[]
  icon?: string
  title: string
  rules: string
  choices: string[]
  vote: string
  currency: TCurrency
  amount: number
  end_date: string
  created: number
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
  group: string
  tags: string[]
  icon: string
  volume: number
  multiplier: number
  end_date: string
  rules: string
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

interface IBetPrediction {
  id: number
  title: string
  group: string
  tags: string[]
  icon: string
  volume: number
  end_date: string
}

interface IBetChoice {
  volume: number
  multiplier: number
  title: string
  win: boolean | null
}

export interface IMyBet {
  id: number
  state: 'ACTIVE' | 'WIN' | 'LOSE' | 'CANCEL'
  currency: TCurrency
  amount: number
  payout: number
  created: number
  choice: IBetChoice
  prediction: IBetPrediction
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
  created: number
}

export interface ITopHolder {
  total: number
  username: string
  avatar: string
  currency: TCurrency
}

export interface IComment {
  id: number
  text: string
  username: string
  avatar: string
  reactions: number
  is_liked: boolean
  owner: boolean
  created: number
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
  currency: TCurrency
  direction: 'IN' | 'OUT'
  amount: number
  created: number
}
