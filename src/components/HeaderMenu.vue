<script setup lang="ts">
import { useRouter } from 'vue-router'
import logoImg from '@/assets/las-delicias-logo.png'
import AmbientMusicPlayer from '@/components/AmbientMusicPlayer.vue'
import {
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  currentTime: string
  currentShiftName?: string
  isRealtimeConnected: boolean
  isSupabaseConfigured: boolean
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', query: string): void
  (e: 'open-bar-modal'): void
}>()

// Slot for extra actions (e.g., custom music button for Bar)
defineSlots<{
  'extra-actions'?: () => any
}>()

const router = useRouter()

function goToAdmin() {
  router.push('/admin')
}
</script>

<template>
  <header class="w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
    <div class="max-w-3xl mx-auto px-4 py-2.5 sm:py-3">
      <!-- Top Row: Prominent Logo & Right Actions (Music & Admin Portal) -->
      <div class="flex items-center justify-between gap-3">
        <!-- Prominent Brand Logo -->
        <div class="flex items-center">
          <img
            :src="logoImg"
            alt="Las Delicias Restobar"
            class="h-10 sm:h-12 w-auto object-contain max-w-[190px] sm:max-w-[240px] drop-shadow-xs"
          />
        </div>

        <!-- Right Controls: Ambient Music & Admin Access -->
        <div class="flex items-center gap-2">
          <!-- Slot for custom extra actions (e.g., Bar music button) -->
          <slot name="extra-actions"></slot>

          <!-- Ambient Music Player -->
          <AmbientMusicPlayer />

          <!-- Subtle Admin Shortcut Button -->
          <button
            type="button"
            @click="goToAdmin"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Acceso al Panel Administrativo"
            aria-label="Ir al panel administrativo"
          >
            <Cog6ToothIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Subheader Row: Realtime Clock, Active Shift & Quick Search -->
      <div class="mt-2 pt-2 border-t border-slate-100 flex flex-row items-center justify-between gap-2">
        <!-- Live status bar -->
        <div class="flex items-center gap-2 text-[11px] text-slate-600 truncate">
          <div class="flex items-center gap-1 font-mono text-slate-800 font-medium">
            <ClockIcon class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{{ currentTime }}</span>
          </div>

          <span class="text-slate-300">•</span>

          <div v-if="currentShiftName" class="inline-flex items-center gap-1 truncate text-slate-700">
            <span class="font-semibold text-brand-primary truncate">{{ currentShiftName }}</span>
          </div>

          <span class="text-slate-300 hidden sm:inline">•</span>

          <!-- Realtime Sync indicator -->
          <div class="hidden sm:inline-flex items-center gap-1 text-[10px]">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span class="text-emerald-700 font-medium">
              Carta Digital en Vivo
            </span>
          </div>
        </div>

        <!-- Quick Search Bar -->
        <div class="relative w-36 sm:w-56 shrink-0">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <MagnifyingGlassIcon class="w-3.5 h-3.5" />
          </div>
          <input
            id="search-dish-input"
            type="text"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            placeholder="Buscar plato..."
            class="input input-xs w-full pl-7 pr-6 bg-slate-50 border-slate-200 text-slate-900 text-[11px] rounded-lg focus:bg-white focus:border-brand-primary focus:outline-none placeholder:text-slate-400 h-7"
          />
          <button
            v-if="searchQuery"
            @click="emit('update:searchQuery', '')"
            class="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <XMarkIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>




