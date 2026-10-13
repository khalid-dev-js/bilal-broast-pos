'use client'

import { io, type Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bilal-broast-backend.vercel.app/api'
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_URL.replace(/\/api\/?$/, '')

let socket: Socket | null = null

export function getSocket() {
  if (typeof window === 'undefined' || !SOCKET_URL) return null
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
}

export { SOCKET_URL }
