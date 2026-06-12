import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from './axios'

/**
 * Realtime transport for the medical-simulation chat.
 *
 * The NestJS `ChatGateway` runs on the default namespace of the same origin as
 * the REST API and authenticates from the handshake query (`handshake.query.auth`),
 * so we pass the in-memory access token there. The token is read lazily at
 * connect time from the axios layer (the auth store keeps it in sync), matching
 * how the REST client sources its bearer token.
 */
const wsURL =
  import.meta.env.VITE_WS_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:3000'

/**
 * Create a (not-yet-connected) socket for a simulation session. The caller owns
 * the lifecycle: wire listeners, then `connect()`, and `disconnect()` when done
 * — disconnecting is what signals the backend to end and analyse the session.
 */
export function createChatSocket(): Socket {
  return io(wsURL, {
    autoConnect: false,
    // Backend reads the token from `handshake.query.auth`, so it must live in
    // the query string (not the Socket.IO `auth` payload).
    query: { auth: getAccessToken() ?? '' },
    // Keep the refresh cookie flowing for parity with the REST client.
    withCredentials: true,
    // Skip the HTTP long-polling upgrade dance; go straight to WebSocket.
    transports: ['websocket'],
  })
}
