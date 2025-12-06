import { config } from '../config/config'
import { store } from '../store/store'
import { addNotification } from '../store/notification.slice'
import type { INotification } from '../types/notification.types'

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private reconnectTimer: number | null = null
  private intentionalDisconnect = false

  connect() {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('No auth token found, skipping WebSocket connection')
      return
    }
    this.intentionalDisconnect = false

    try {
      // Send token as query parameter
      this.ws = new WebSocket(`${config.wsUrl}?token=${token}`)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.clearReconnectTimer()
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
        message: data.message,
        type: data.notificationType || 'info',
        timestamp: data.timestamp || Date.now(),
        read: false,
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
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(data))
    else console.warn('WebSocket is not connected')
  }

  // Notification commands
  sendMarkAsRead(notificationId: string) {
    this.send({ type: 'notification_mark_read', notificationId })
  }

  sendMarkAllAsRead() {
    this.send({ type: 'notification_mark_all_read' })
  }

  sendRemoveNotification(notificationId: string) {
    this.send({ type: 'notification_remove', notificationId })
  }

  sendClearAllNotifications() {
    this.send({ type: 'notification_clear_all' })
  }
}

export const wsService = new WebSocketService()
