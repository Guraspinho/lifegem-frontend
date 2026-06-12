import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { setAuthErrorHandler } from './api/axios'
import { useAuthStore } from './stores/auth.store'

async function bootstrap(): Promise<void> {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  const auth = useAuthStore()

  // When a token refresh fails, reset auth state and bounce to /login.
  setAuthErrorHandler(() => {
    auth.clear()
    void router.push({ name: 'login' })
  })

  // Attempt to restore a session from the httpOnly refresh cookie before the
  // first navigation, so route guards see the correct auth state on load.
  await auth.restoreSession()

  app.use(router)
  await router.isReady()
  app.mount('#app')
}

void bootstrap()
