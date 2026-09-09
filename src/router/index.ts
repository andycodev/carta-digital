import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '@/views/MenuView.vue'
import BarMenuView from '@/views/BarMenuView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminProducts from '@/views/admin/AdminProducts.vue'
import AdminCartas from '@/views/admin/AdminCartas.vue'
import AdminQR from '@/views/admin/AdminQR.vue'
import AdminFlyers from '@/views/admin/AdminFlyers.vue'
import AdminConfig from '@/views/admin/AdminConfig.vue'
import AdminWhatsApp from '@/views/admin/AdminWhatsApp.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'public-menu',
    component: MenuView,
    meta: { title: 'Las Delicias Restobar | Carta Digital' }
  },
  {
    path: '/bar',
    name: 'public-bar',
    component: BarMenuView,
    meta: { title: 'Bar & Coctelería | Las Delicias Restobar' }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: 'Iniciar Sesión | Las Delicias Restobar', requiresGuest: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { title: 'Dashboard | Panel Admin', requiresAuth: true }
      },
      {
        path: 'productos',
        name: 'admin-productos',
        component: AdminProducts,
        meta: { title: 'Productos | Panel Admin', requiresAuth: true }
      },
      {
        path: 'cartas',
        name: 'admin-cartas',
        component: AdminCartas,
        meta: { title: 'Cartas y Horarios | Panel Admin', requiresAuth: true }
      },
      {
        path: 'qr',
        name: 'admin-qr',
        component: AdminQR,
        meta: { title: 'Códigos QR de las Cartas | Panel Admin', requiresAuth: true }
      },
      {
        path: 'flyers',
        name: 'admin-flyers',
        component: AdminFlyers,
        meta: { title: 'Descargar Flyers | Panel Admin', requiresAuth: true }
      },
      {
        path: 'suscriptores',
        name: 'admin-suscriptores',
        component: AdminWhatsApp,
        meta: { title: 'Suscriptores WhatsApp | Panel Admin', requiresAuth: true }
      },
      {
        path: 'configuracion',
        name: 'admin-config',
        component: AdminConfig,
        meta: { title: 'Configuración | Panel Admin', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, _, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  const { initAuth, isAuthenticated } = useAuth()
  await initAuth()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !isAuthenticated.value) {
    // Redirect to login if user attempts to access protected route without session
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  if (requiresGuest && isAuthenticated.value) {
    // If authenticated user visits login, send to admin panel
    next({ path: '/admin' })
    return
  }

  next()
})

export default router
