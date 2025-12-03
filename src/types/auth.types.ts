export interface User {
  id: string
  email?: string
  walletAddress?: string
  telegram?: string
  authMethod: 'web3' | 'email' | 'telegram'
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface Web3AuthPayload {
  walletAddress: string
  signature: string
  message: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  code?: string
}
