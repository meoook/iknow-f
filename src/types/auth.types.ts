export interface IUser {
  id: string
  email?: string
  walletAddress?: string
  telegram?: string
  authMethod: 'web3' | 'email' | 'telegram'
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
