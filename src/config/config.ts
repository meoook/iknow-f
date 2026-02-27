export const config = {
  imgBaseUrl: 'http://localhost/static',
  apiBaseUrl: 'http://localhost/api',
  wsUrl: 'ws://localhost/ws',
  // WalletConnect Project ID - get from https://cloud.walletconnect.com/
  walletConnectProjectId: 'YOUR_PROJECT_ID_HERE',
  telegramBot: 'the_vanga_bot',
} as const

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
