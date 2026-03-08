import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL } from '../utils/api'

export function useWebSocket(roomCode, userId) {
  const ws = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    if (!roomCode || !userId) return

    const url = `${WS_URL}/ws/${roomCode}/${userId}`
    ws.current = new WebSocket(url)

    ws.current.onopen = () => {
      setIsConnected(true)
      // Announce join
      ws.current.send(JSON.stringify({ type: 'participant_joined' }))
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (e) {}
    }

    ws.current.onclose = () => {
      setIsConnected(false)
      // Reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000)
    }

    ws.current.onerror = () => {
      ws.current?.close()
    }
  }, [roomCode, userId])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }, [])

  return { isConnected, lastMessage, sendMessage }
}
