/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API, e.g. http://localhost:3000 */
  readonly VITE_API_BASE_URL?: string
  /** Socket.IO server origin for the simulation chat; defaults to the API URL. */
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
