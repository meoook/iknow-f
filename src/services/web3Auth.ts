import { createWalletClient, custom, type WalletClient } from 'viem'
import { mainnet } from 'viem/chains'
import type { IWeb3NonceResponse } from '../types/web3.types'

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

export type WalletType = 'metamask' | 'phantom'

export class Web3AuthService {
  private walletClient: WalletClient | null = null

  async connectWallet(type: WalletType = 'metamask'): Promise<string> {
    let provider = window.ethereum

    if (type === 'phantom') {
      provider = (window as any).phantom?.ethereum
    } else if (type === 'metamask') {
      // If multiple wallets are installed, window.ethereum might be Phantom or a proxy.
      // We need to find the one that is actually MetaMask.
      if (provider?.providers?.length) {
        provider = provider.providers.find((p: any) => p.isMetaMask)
      } else if (!provider?.isMetaMask && (window as any).ethereum?.isMetaMask) {
        provider = (window as any).ethereum
      } else if (!provider?.isMetaMask) {
        // Some wallets like Phantom might overwrite window.ethereum.
        // If we specifically want MetaMask and the current provider isn't it,
        // we might not be able to find it easily unless it's in the providers array.
        // But usually, MetaMask is at least present or reachable.
      }
    }

    if (!provider || (type === 'metamask' && !provider.isMetaMask)) {
      const walletName = type === 'metamask' ? 'MetaMask' : 'Phantom'
      throw new Error(`${walletName} wallet not found or another wallet is overriding it`)
    }

    try {
      // Request account access
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
      if (!accounts || accounts.length === 0) throw new Error('No accounts found')
      // Create wallet client
      this.walletClient = createWalletClient({ chain: mainnet, transport: custom(provider) })
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
    w3nonce: (params: { chain: number; address: string }) => Promise<{ data?: IWeb3NonceResponse }>,
    walletType: WalletType = 'metamask'
  ): Promise<{ signature: string; message: string }> {
    // Connect wallet
    const walletAddress = await this.connectWallet(walletType)

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
