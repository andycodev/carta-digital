<script setup lang="ts">
import type { Categoria } from '@/types/database'
import {
  SunIcon,
  FireIcon,
  MoonIcon,
  SparklesIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  categories: Categoria[]
  selectedId: string | null
  currentShiftId: string | null
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()

function formatShiftRange(inicio: string, fin: string): string {
  if (!inicio || !fin) return ''
  const clean = (t: string) => t.substring(0, 5)
  return `${clean(inicio)} - ${clean(fin)}`
}
</script>

<template>
  <div class="w-full sticky top-[73px] sm:top-[77px] z-30 bg-[#F8F9FA]/95 backdrop-blur-md py-1.5 border-b border-slate-200/60 shadow-2xs">
    <div class="max-w-3xl mx-auto px-3.5 sm:px-4">
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          :id="`tab-${cat.id}`"
          class="shrink-0 text-xs font-medium py-1.5 px-3 rounded-lg transition-all duration-150 whitespace-nowrap flex items-center gap-1.5 border select-none cursor-pointer"
          :class="[
            selectedId === cat.id
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          ]"
          @click="emit('select', cat.id)"
        >
          <!-- Category Heroicon Indicator -->
          <SparklesIcon v-if="cat.siempre_disponible" class="w-3.5 h-3.5" />
          <SunIcon v-else-if="cat.nombre.toLowerCase().includes('desayuno')" class="w-3.5 h-3.5" />
          <FireIcon v-else-if="cat.nombre.toLowerCase().includes('almuerzo')" class="w-3.5 h-3.5" />
          <MoonIcon v-else-if="cat.nombre.toLowerCase().includes('cena')" class="w-3.5 h-3.5" />
          <BuildingStorefrontIcon v-else class="w-3.5 h-3.5" />

          <span>{{ cat.nombre }}</span>

          <!-- Status Badges -->
          <span
            v-if="cat.id === currentShiftId && !cat.siempre_disponible"
            class="hidden sm:inline-flex items-center text-[10px] px-1 py-0.2 rounded-full font-medium"
            :class="selectedId === cat.id ? 'bg-white/20 text-white' : 'bg-brand-primary/10 text-brand-primary'"
          >
            En turno
          </span>

          <span
            v-else-if="cat.siempre_disponible"
            class="hidden sm:inline-flex text-[10px] px-1 py-0.2 rounded-full font-medium"
            :class="selectedId === cat.id ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'"
          >
            24/7
          </span>

          <span
            v-else
            class="hidden md:inline text-[10px] opacity-75 font-mono"
          >
            {{ formatShiftRange(cat.hora_inicio, cat.hora_fin) }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>



