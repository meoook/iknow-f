import { createWalletClient, custom, type WalletClient } from 'viem'
import { mainnet } from 'viem/chains'
import type { Web3MessageNonce } from '../types/web3.types'

// Helper function to format date to local YYYY-MM-DD hh:mm:ss
function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export class Web3AuthService {
  private walletClient: WalletClient | null = null

  async connectWallet(): Promise<string> {
    if (typeof window.ethereum === 'undefined') throw new Error('MetaMask or compatible wallet not found')

    try {
      // Request account access
      const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[]
      if (!accounts || accounts.length === 0) throw new Error('No accounts found')
      // Create wallet client
      this.walletClient = createWalletClient({ chain: mainnet, transport: custom(window.ethereum) })
      return accounts[0]
    } catch (error: any) {
      if (error.code === 4001) throw new Error('User rejected the connection request')
      throw error
    }
  }

  async signMessage(address: string, message: string): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet not connected')
    try {
      const signature = await this.walletClient.signMessage({ account: address as `0x${string}`, message })
      return signature
    } catch (error: any) {
      if (error.code === 4001) throw new Error('User rejected the signature request')
      throw error
    }
  }

  async authenticateWithWeb3(
    w3nonce: (params: { chain: number; address: string }) => Promise<{ data?: Web3MessageNonce }>
  ): Promise<{ signature: string; message: string }> {
    // Connect wallet
    const walletAddress = await this.connectWallet()

    // Get nonce from server
    const nonceResponse = await w3nonce({ chain: 1, address: walletAddress })
    if (!nonceResponse.data) throw new Error('Failed to get nonce from server')

    const { nonce, expire } = nonceResponse.data

    // Create message to sign with nonce
    let message = `iKnow wants you to sign in with your account:\n${walletAddress}`
    message += `\n\nNonce: ${nonce}`
    message += `\nIssued At: ${formatLocalDateTime(new Date())}`
    message += `\nExpire At: ${formatLocalDateTime(new Date(expire * 1000))}`

    // Sign message
    const signature = await this.signMessage(walletAddress, message)
    return { signature, message }
  }

  disconnect() {
    this.walletClient = null
  }
}

export const web3AuthService = new Web3AuthService()

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
