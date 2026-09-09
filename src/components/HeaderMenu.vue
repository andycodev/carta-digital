<script setup lang="ts">
import logoImg from '@/assets/las-delicias-logo.png'
import AmbientMusicPlayer from '@/components/AmbientMusicPlayer.vue'

const props = defineProps<{
  currentTime: string
  currentShiftName?: string
  isRealtimeConnected: boolean
  isSupabaseConfigured: boolean
  searchQuery: string
  darkMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', query: string): void
  (e: 'open-bar-modal'): void
}>()

// Slot for extra actions (e.g., custom music button for Bar)
defineSlots<{
  'extra-actions'?: () => any
}>()
</script>

<template>
  <header :class="[
    'w-full border-b backdrop-blur-md sticky top-0 z-40 shadow-xs',
    darkMode ? 'border-white/10 bg-[#0d0d1a]/95' : 'border-slate-200/90 bg-white/95'
  ]">
    <div class="max-w-3xl mx-auto px-4 py-2">
      <!-- Layout horizontal con título centrado -->
      <div class="flex items-center justify-between gap-3">
        <!-- Logo a la izquierda más grande -->
        <div class="flex items-center">
          <img :src="logoImg" alt="Las Delicias Restobar" class="h-14 sm:h-16 w-auto object-contain" />
        </div>

        <!-- Título centrado -->
        <div class="flex-1 text-center">
          <h1 :class="[
            'text-sm sm:text-base font-bold',
            darkMode ? 'text-white' : 'text-slate-800'
          ]">
            Carta Digital - Las Delicias Restobar
          </h1>
        </div>

        <!-- Controles derechos horizontales -->
        <div class="flex items-center gap-2">
          <!-- Slot para acciones extra -->
          <slot name="extra-actions"></slot>

          <!-- Ambient Music Player -->
          <AmbientMusicPlayer :dark-mode="darkMode" />
        </div>
      </div>
    </div>
  </header>
</template>
