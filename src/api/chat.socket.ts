import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from './axios'

const wsURL =
  import.meta.env.VITE_WS_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000'

export function createChatSocket(): Socket {
  return io(wsURL, {
    autoConnect: false,
    query: { auth: getAccessToken() ?? '' },
    withCredentials: true,
    transports: ['websocket'],
  })
}
