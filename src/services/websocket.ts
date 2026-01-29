import { config } from '../config/config'
import { store } from '../store/store'
import { addNotification } from '../store/app.slice'
import { setBalance } from '../store/auth.slice'

const WsOutEvent = {
  auth: 'auth',
  logout: 'logout',
} as const

type WsOutEvent = (typeof WsOutEvent)[keyof typeof WsOutEvent]

const WsInEvent = {
  notify: 'notify',
  balance: 'balance',
} as const

type WsInEvent = (typeof WsInEvent)[keyof typeof WsInEvent]

interface WsInMessage {
  type: WsInEvent
  value?: any
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 3000
  private reconnectTimer: number | null = null
  private intentionalDisconnect = false
  private token: string = ''
  private messageQueue: { type: WsOutEvent; value: any }[] = []

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.intentionalDisconnect = false

    try {
      // Send token as query parameter
      this.ws = new WebSocket(config.wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.clearReconnectTimer()

        // Re-authenticate if we have a token and it's not already in the queue
        if (this.token && !this.messageQueue.find((m) => m.type === WsOutEvent.auth)) {
          this.auth(this.token)
        }

        this.flushQueue()
      }
      this.ws.onmessage = (event) => {
        try {
          const msg: WsInMessage = JSON.parse(event.data)
          this.handleMessage(msg)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        // Only attempt reconnect if it wasn't intentional
        if (!this.intentionalDisconnect) this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      if (!this.intentionalDisconnect) this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      this.connect()
    }, this.reconnectDelay)
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) return
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  disconnect() {
    // Mark as intentional disconnect to prevent auto-reconnect
    this.intentionalDisconnect = true
    this.clearReconnectTimer()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = 0
  }

  private handleMessage(msg: WsInMessage) {
    if (msg.type === WsInEvent.notify) store.dispatch(addNotification(msg.value))
    else if (msg.type === WsInEvent.balance) store.dispatch(setBalance(msg.value))
    else console.log(`Unknown message type: ${msg.type} with value: ${msg.value}`)
  }

  private send(type: WsOutEvent, value: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, value }))
    } else {
      console.log(`WebSocket not connected. Queueing message: ${type}`)
      this.messageQueue.push({ type, value })
    }
  }

  private flushQueue() {
    console.log(`Flushing WebSocket queue (${this.messageQueue.length} messages)`)
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()
      if (msg) this.send(msg.type, msg.value)
    }
  }

  // Notification commands
  auth(token: string) {
    this.token = token
    this.send(WsOutEvent.auth, token)
  }

  logout() {
    this.token = ''
    this.send(WsOutEvent.logout, null)
  }

  // sendMarkAllAsRead() {
  //   this.send(WsOutEvent.notification_all_read, null)
  // }

  // sendRemoveNotification(notificationId: string) {
  //   this.send(WsOutEvent.notification_remove, notificationId)
  // }

  // sendClearAllNotifications() {
  //   this.send(WsOutEvent.notification_clear, null)
  // }
}

export const wsService = new WebSocketService()
