interface IBalances {
  POINT: number
  CASH: number
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
}

export interface IAuthResponse {
  token: string
}
