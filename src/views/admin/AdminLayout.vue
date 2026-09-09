<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import logoImg from '@/assets/las-delicias-logo.png'
import {
  ChartBarIcon,
  ShoppingBagIcon,
  ClockIcon,
  QrCodeIcon,
  PhotoIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const isMobileNavOpen = ref(false)
const { user, signOut } = useAuth()

const navLinks = [
  { path: '/admin', name: 'Dashboard', icon: ChartBarIcon, exact: true },
  { path: '/admin/productos', name: 'Productos', icon: ShoppingBagIcon },
  { path: '/admin/cartas', name: 'Cartas y Horarios', icon: ClockIcon },
  { path: '/admin/qr', name: 'Códigos QR de Cartas', icon: QrCodeIcon },
  { path: '/admin/flyers', name: 'Descargar Flyers', icon: PhotoIcon },
  { path: '/admin/configuracion', name: 'Configuración & Música', icon: Cog6ToothIcon }
]

function isActive(link: { path: string, exact?: boolean }) {
  if (link.exact) {
    return route.path === link.path
  }
  return route.path.startsWith(link.path)
}

function openPublicMenu() {
  window.open('/', '_blank')
}

async function handleSignOut() {
  await signOut()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col sm:flex-row text-slate-800">
    <!-- Mobile Top Bar -->
    <div class="sm:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div class="flex items-center gap-2">
        <img :src="logoImg" alt="Logo" class="h-8 w-auto object-contain" />
        <span class="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">ADMIN</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openPublicMenu"
          class="btn btn-xs btn-outline border-brand-primary text-brand-primary rounded-lg flex items-center gap-1 cursor-pointer"
          title="Ver Carta Pública"
        >
          <span>Ver Carta</span>
          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          @click="isMobileNavOpen = !isMobileNavOpen"
          class="btn btn-xs btn-ghost text-slate-700 p-1 cursor-pointer"
        >
          <Bars3Icon class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Drawer Navigation -->
    <div
      v-if="isMobileNavOpen"
      class="sm:hidden fixed inset-0 bg-black/50 z-40"
      @click="isMobileNavOpen = false"
    >
      <div
        class="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-xl"
        @click.stop
      >
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <img :src="logoImg" alt="Logo" class="h-8 w-auto object-contain" />
            <button @click="isMobileNavOpen = false" class="text-slate-400 hover:text-slate-700 cursor-pointer p-1">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <nav class="space-y-1">
            <router-link
              v-for="item in navLinks"
              :key="item.path"
              :to="item.path"
              @click="isMobileNavOpen = false"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              :class="isActive(item) ? 'bg-brand-primary text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'"
            >
              <div class="flex items-center gap-3">
                <component :is="item.icon" class="w-5 h-5 shrink-0" />
                <span>{{ item.name }}</span>
              </div>
            </router-link>
          </nav>
        </div>

        <div class="pt-4 border-t border-slate-100 space-y-3">
          <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <UserCircleIcon class="w-7 h-7 text-slate-400 shrink-0" />
            <div class="min-w-0 flex-1">
              <div class="text-xs font-bold text-slate-800 truncate">{{ user?.email || 'Administrador' }}</div>
              <div class="text-[10px] text-emerald-600 font-medium">Sesión Segura</div>
            </div>
          </div>

          <button
            type="button"
            @click="handleSignOut"
            class="w-full btn btn-sm btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

          <div class="text-[10px] text-center text-slate-400">
            Las Delicias Restobar • Panel v2.0
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <aside class="hidden sm:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 sticky top-0 h-screen shadow-xs">
      <div class="p-5">
        <!-- Brand Header -->
        <div class="pb-5 border-b border-slate-100">
          <img :src="logoImg" alt="Las Delicias Restobar" class="h-11 w-auto object-contain mb-2" />
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Panel de Control</span>
            <span class="badge badge-xs bg-emerald-100 text-emerald-700 font-mono font-medium px-1.5 py-0.5">En Línea</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="mt-5 space-y-1">
          <router-link
            v-for="item in navLinks"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
            :class="isActive(item) ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-5 h-5 shrink-0" />
              <span>{{ item.name }}</span>
            </div>
          </router-link>
        </nav>
      </div>

      <!-- Footer Info & Public Menu Button & Sign Out -->
      <div class="p-4 border-t border-slate-100 space-y-2.5">
        <div class="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
          <UserCircleIcon class="w-7 h-7 text-slate-400 shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate" :title="user?.email">{{ user?.email || 'Administrador' }}</div>
            <div class="text-[10px] text-emerald-600 font-medium">Supabase Auth</div>
          </div>
        </div>

        <button
          type="button"
          @click="openPublicMenu"
          class="w-full btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <ArrowTopRightOnSquareIcon class="w-4 h-4" />
          <span>Ver Carta Pública</span>
        </button>

        <button
          type="button"
          @click="handleSignOut"
          class="w-full btn btn-xs btn-ghost text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer py-1.5 transition-colors"
        >
          <ArrowRightOnRectangleIcon class="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>

        <p class="text-[10px] text-center text-slate-400 pt-1">
          Las Delicias Restobar © {{ new Date().getFullYear() }}
        </p>
      </div>
    </aside>

    <!-- Main Admin Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Desktop Top Header -->
      <header class="hidden sm:flex bg-white border-b border-slate-200 px-6 py-3.5 items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-900">
            Administración de Carta y Operaciones
          </h1>
          <p class="text-xs text-slate-500">
            Los cambios se actualizan automáticamente en tiempo real en la carta de los clientes.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="handleSignOut"
            class="btn btn-sm btn-outline border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center gap-1.5 rounded-xl text-xs cursor-pointer"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

          <router-link
            to="/"
            class="btn btn-sm btn-ghost text-slate-600 hover:text-slate-900 flex items-center gap-1.5 rounded-xl text-xs"
          >
            <ArrowLeftIcon class="w-3.5 h-3.5" />
            <span>Volver a Carta</span>
          </router-link>
        </div>
      </header>

      <!-- Routed Content -->
      <main class="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

