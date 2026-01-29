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
  address: string
  username: string
  email?: string
  email_notify: boolean
  telegram_id: string
  telegram_notify: boolean
  avatar?: string
  balances: IBalances
}

export interface IAuthState {
  user: IUser | null
  token: string | null
  loading: boolean
  showLoginModal: boolean
}

export interface IAuthResponse {
  token: string
}
