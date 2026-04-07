const TCurrency = {
  POINT: 'POINT',
  CASH: 'CASH',
} as const

export type TCurrency = (typeof TCurrency)[keyof typeof TCurrency]

interface IBalances {
  [TCurrency.POINT]: number
  [TCurrency.CASH]: number
}

export interface IBalanceUpdate {
  currency: TCurrency
  amount: number
}

export interface IUser {
  id: number
  address: string
  username: string
  email?: string
  email_notify: boolean
  telegram_id: string
  telegram_notify: boolean
  avatar?: string
  balances: IBalances
}

export interface IUserCard {
  id: number
  username: string
  avatar?: string
  amount: number
  payout: number
  count: number
  predictions: number
  max_win: number
  profit_all: number
  profit_d: number
  profit_w: number
  profit_m: number
  created: number
}

export interface IAuthState {
  user: IUser | null
  loading: boolean
}

export interface IAuthResponse {
  user: IUser
}
