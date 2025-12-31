export const config = {
  apiBaseUrl: 'http://localhost/api',
  wsUrl: 'ws://localhost/ws',
  // WalletConnect Project ID - get from https://cloud.walletconnect.com/
  walletConnectProjectId: 'YOUR_PROJECT_ID_HERE',
} as const

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
