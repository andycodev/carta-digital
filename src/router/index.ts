import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '@/views/MenuView.vue'
import BarMenuView from '@/views/BarMenuView.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminProducts from '@/views/admin/AdminProducts.vue'
import AdminCartas from '@/views/admin/AdminCartas.vue'
import AdminMesas from '@/views/admin/AdminMesas.vue'
import AdminFlyers from '@/views/admin/AdminFlyers.vue'
import AdminConfig from '@/views/admin/AdminConfig.vue'
import AdminWhatsApp from '@/views/admin/AdminWhatsApp.vue'

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
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { title: 'Dashboard | Panel Admin' }
      },
      {
        path: 'productos',
        name: 'admin-productos',
        component: AdminProducts,
        meta: { title: 'Productos | Panel Admin' }
      },
      {
        path: 'cartas',
        name: 'admin-cartas',
        component: AdminCartas,
        meta: { title: 'Cartas y Horarios | Panel Admin' }
      },
      {
        path: 'qr',
        name: 'admin-qr',
        component: AdminMesas,
        meta: { title: 'Códigos QR de las Cartas | Panel Admin' }
      },
      {
        path: 'mesas',
        redirect: '/admin/qr'
      },
      {
        path: 'flyers',
        name: 'admin-flyers',
        component: AdminFlyers,
        meta: { title: 'Descargar Flyers | Panel Admin' }
      },
      {
        path: 'suscriptores',
        name: 'admin-suscriptores',
        component: AdminWhatsApp,
        meta: { title: 'Suscriptores WhatsApp | Panel Admin' }
      },
      {
        path: 'configuracion',
        name: 'admin-config',
        component: AdminConfig,
        meta: { title: 'Configuración | Panel Admin' }
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

router.beforeEach((to, _, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router
