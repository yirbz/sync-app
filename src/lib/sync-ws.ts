type MessageHandler = (msg: any) => void

class SyncWsClient {
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<MessageHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private url = ""
  private auth: { token: string; userId: string; roomId: string } | null = null
  private connected = false

  get isConnected() { return this.connected }

  connect(host: string, token: string, userId: string, roomId: string) {
    this.url = `ws://${host}/ws`
    this.auth = { token, userId, roomId }
    this._connect()
  }

  private _connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) return

    this.connected = false
    this.ws = new WebSocket(this.url)

    this.ws.onopen = () => {
      if (this.auth) {
        this.ws!.send(JSON.stringify({ type: "auth", ...this.auth }))
      }
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === "auth_ok") { this.connected = true; return }
        const handlers = this.handlers.get(msg.type)
        if (handlers) {
          for (const h of handlers) h(msg)
        }
      } catch {}
    }

    this.ws.onclose = () => {
      this.connected = false
      this.ws = null
      this.reconnectTimer = setTimeout(() => this._connect(), 3000)
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  send(msg: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set())
    this.handlers.get(type)!.add(handler)
    return () => { this.handlers.get(type)?.delete(handler) }
  }

  off(type: string) {
    this.handlers.delete(type)
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
    this.ws = null
    this.connected = false
    this.handlers.clear()
  }
}

export const syncWs = new SyncWsClient()
