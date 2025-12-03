import { createWalletClient, custom, type WalletClient } from 'viem'
import { mainnet } from 'viem/chains'

export class Web3AuthService {
  private walletClient: WalletClient | null = null

  async connectWallet(): Promise<string> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask or compatible wallet not found')
    }

    try {
      // Request account access
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Create wallet client
      this.walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      })

      return accounts[0]
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request')
      }
      throw error
    }
  }

  async signMessage(address: string, message: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      const signature = await this.walletClient.signMessage({
        account: address as `0x${string}`,
        message,
      })

      return signature
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the signature request')
      }
      throw error
    }
  }

  async authenticateWithWeb3(): Promise<{
    walletAddress: string
    signature: string
    message: string
  }> {
    // Connect wallet
    const walletAddress = await this.connectWallet()

    // Create message to sign
    const message = `Sign this message to authenticate with iKnow.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`

    // Sign message
    const signature = await this.signMessage(walletAddress, message)

    return {
      walletAddress,
      signature,
      message,
    }
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
