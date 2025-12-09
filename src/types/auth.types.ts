export interface IUser {
  address: string
  balance: string
  username?: string
  email?: string
  email_validated: boolean
  telegram_id: string
  avatar?: string
}

export interface IAuthState {
  user: IUser | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface ILoginCredentials {
  email: string
  password: string
}

export interface IWeb3AuthPayload {
  walletAddress: string
  signature: string
  message: string
}

export interface IAuthResponse {
  token: string
  user: IUser
}

export interface IApiError {
  message: string
  code?: string
}
