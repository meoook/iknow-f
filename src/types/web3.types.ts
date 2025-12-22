export interface IWeb3NonceResponse {
  nonce: string
  expire: number
}

export interface IWeb3NonceRequest {
  chain: number
  address: string
}

export interface IWeb3AuthRequest {
  message: string
  signature: string
}
