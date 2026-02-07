import { config } from '../config/config'
import { store } from '../store/store'
import { addNotification } from '../store/app.slice'
import { setBalance } from '../store/auth.slice'
import { apiBase } from './api'
import type { IPredictionDetail } from '../types/app.types'

const WsOutEvent = {
  auth: 'auth',
  logout: 'logout',
  prediction_join: 'prediction.join',
  prediction_left: 'prediction.left',
} as const

type WsOutEvent = (typeof WsOutEvent)[keyof typeof WsOutEvent]

const WsInEvent = {
  notify: 'notify',
  balance: 'balance',
  prediction_updated: 'prediction.updated',
  comment_created: 'comment.created',
  comment_updated: 'comment.updated',
  comment_deleted: 'comment.deleted',
  comment_like: 'comment.like',
  comment_dislike: 'comment.dislike',
} as const

type WsInEvent = (typeof WsInEvent)[keyof typeof WsInEvent]

interface WsInMessage {
  type: WsInEvent
  value?: any
}

type Handler = (data: any) => void

class WebSocketManager {
  private ws: WebSocket | null = null
  private token: string = ''
  private rooms = new Map<number, number>()
  private messageQueue: { type: WsOutEvent; value: any }[] = []
  private handlers = new Map<WsInEvent, Set<Handler>>()
  // reconnect
  private reconnectAttempts = 0
  private reconnectAttemptsMax = 3
  private reconnectDelay = 3000
  private reconnectTimer: number | null = null

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) return

    try {
      this.ws = new WebSocket(config.wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.clearReconnectTimer()
        // Re-authenticate if we have a token and it's not already in the queue
        if (this.token && !this.messageQueue.find((m) => m.type === WsOutEvent.auth)) this.auth(this.token)
        // Re-join rooms if we have any
        this.rooms.forEach((room) => {
          this.send(WsOutEvent.prediction_join, room)
        })
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
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.reconnectAttemptsMax) {
      console.error('Max reconnection attempts reached')
      return
    }

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.reconnectAttemptsMax})...`)
      this.connect()
    }, this.reconnectDelay)
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) return
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private handleMessage(msg: WsInMessage) {
    if (msg.type === WsInEvent.notify) store.dispatch(addNotification(msg.value))
    else if (msg.type === WsInEvent.balance) store.dispatch(setBalance(msg.value))
    else if (msg.type === WsInEvent.prediction_updated) this.predictionUpdate(msg.value)
    else {
      const handlers = this.handlers.get(msg.type)
      handlers?.forEach((h) => h(msg.value))
    }
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

  // Subscribe

  subscribe(event: WsInEvent, handler: Handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  unsubscribe(event: WsInEvent, handler: Handler) {
    this.handlers.get(event)?.delete(handler)
  }

  // Incoming events

  private predictionUpdate(prediction: IPredictionDetail) {
    if (prediction && prediction.id) {
      store.dispatch(
        (apiBase.util as any).updateQueryData('getPrediction', prediction.id, (draft: IPredictionDetail) => {
          Object.assign(draft, prediction)
        }),
      )
    }
  }

  // Outgoing commands

  auth(token: string) {
    this.token = token
    this.send(WsOutEvent.auth, token)
  }

  logout() {
    this.token = ''
    this.send(WsOutEvent.logout, null)
  }

  predictionJoin(predictionId: number) {
    const count = this.rooms.get(predictionId) || 0
    this.rooms.set(predictionId, count + 1)
    if (count === 0) this.send(WsOutEvent.prediction_join, predictionId)
  }

  predictionLeave(predictionId: number) {
    const count = this.rooms.get(predictionId)
    if (!count) return

    if (count === 1) {
      this.rooms.delete(predictionId)
      this.send(WsOutEvent.prediction_left, predictionId)
    } else {
      this.rooms.set(predictionId, count - 1)
    }
  }
}

export const wsManager = new WebSocketManager()
