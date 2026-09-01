export interface IUser {
  id: number
  address: string
  username: string
  email?: string
  email_notify: boolean
  telegram_id: string
  telegram_notify: boolean
  avatar?: string
  bio: string
  balance: number
}

export interface IUserPublic {
  id: number
  username: string
  avatar?: string
  bio: string
  // amount: number
  // payout: number
  count: number
  predictions: number
  max_win: number
  created: number
}

export interface IAuthState {
  user: IUser | null
  loading: boolean
}

export interface IAuthResponse {
  ok: boolean
}
