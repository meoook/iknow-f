import { config } from '../config/config'
import { store } from '../store/store'
import { addNotification } from '../store/app.slice'
import type { INotification } from '../types/app.types'

const WsOutEvent = {
  auth: 'auth',
  notification_read: 'notification_read',
  notification_all_read: 'notification_all_read',
  notification_remove: 'notification_remove',
  notification_clear: 'notification_clear',
} as const

type WsOutEvent = (typeof WsOutEvent)[keyof typeof WsOutEvent]

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3
  private reconnectDelay = 3000
  private reconnectTimer: number | null = null
  private intentionalDisconnect = false
  private token: string = ''
  private isConnected = false

  connect(token?: string | null) {
    // const token = localStorage.getItem('auth_token')
    if (this.isConnected) return
    if (token) this.token = token
    if (!this.token) {
      console.warn('No auth token found, skipping WebSocket connection')
      return
    }
    this.intentionalDisconnect = false

    try {
      // Send token as query parameter
      this.ws = new WebSocket(`${config.wsUrl}?token=${this.token}`)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.clearReconnectTimer()
        this.isConnected = true
      }
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
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
        this.isConnected = false
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      if (!this.intentionalDisconnect) this.attemptReconnect()
    }
  }

  private handleMessage(data: any) {
    // Handle different message types
    if (data.type === 'notification') {
      const notification: INotification = {
        id: data.id || Date.now().toString(),
        text: data.message,
        alert_type: data.notificationType || 'ℹ️',
        title: data.title || 'Notification',
        read: data.read || false,
        created: data.created || new Date().toISOString(),
      }

      store.dispatch(addNotification(notification))
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
    this.isConnected = false
  }

  private send(type: WsOutEvent, value: any) {
    const data = { type, value }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data))
    else console.warn('WebSocket is not connected')
  }

  // Notification commands
  sendMarkAsRead(notificationId: string) {
    this.send(WsOutEvent.notification_read, notificationId)
  }

  sendMarkAllAsRead() {
    this.send(WsOutEvent.notification_all_read, null)
  }

  sendRemoveNotification(notificationId: string) {
    this.send(WsOutEvent.notification_remove, notificationId)
  }

  sendClearAllNotifications() {
    this.send(WsOutEvent.notification_clear, null)
  }
}

export const wsService = new WebSocketService()
