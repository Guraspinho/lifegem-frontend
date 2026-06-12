import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// Route-level meta flags drive the global guard below.
declare module 'vue-router' {
  interface RouteMeta {
    /** Requires an authenticated session; redirects to /login otherwise. */
    requiresAuth?: boolean
    /** Only for unauthenticated users; redirects authed users to home. */
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    // Unknown routes fall back to home (which itself guards for auth).
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
})

/**
 * Global auth guard. The session is restored before mount (see main.ts), so by
 * the time navigation happens `isAuthenticated` reflects the real state.
 */
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }

  return true
})

export default router
