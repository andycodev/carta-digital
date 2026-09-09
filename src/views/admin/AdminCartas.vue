<script setup lang="ts">
import { ref } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import type { Categoria } from '@/types/database'
import {
  SunIcon,
  FireIcon,
  MoonIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

const { categories, updateCategory, toggleCategoryActive } = useMenuStore()

const savedNotice = ref<string | null>(null)

function handleUpdateSchedule(cat: Categoria, field: 'hora_inicio' | 'hora_fin', value: string) {
  // Ensure formatted with seconds for consistency e.g. "07:00:00"
  const formatted = value.length === 5 ? `${value}:00` : value
  updateCategory(cat.id, { [field]: formatted })
  showNotice(`Horario de ${cat.nombre} actualizado.`)
}

function handleToggle247(cat: Categoria) {
  updateCategory(cat.id, { siempre_disponible: !cat.siempre_disponible })
  showNotice(`Modo 24/7 de ${cat.nombre} actualizado.`)
}

function handleToggleActive(catId: string, name: string) {
  toggleCategoryActive(catId)
  showNotice(`Estado de ${name} actualizado.`)
}

function showNotice(msg: string) {
  savedNotice.value = msg
  setTimeout(() => {
    savedNotice.value = null
  }, 3000)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Gestión de Cartas y Horarios</h2>
        <p class="text-xs text-slate-500">
          Define qué cartas se activan automáticamente según la hora del día o déjalas siempre activas.
        </p>
      </div>

      <div v-if="savedNotice" class="inline-flex items-center gap-1.5 badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-2 font-medium">
        <CheckCircleIcon class="w-4 h-4 text-emerald-600" />
        <span>{{ savedNotice }}</span>
      </div>
    </div>

    <!-- Cards for each Shift / Carta -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs transition-all space-y-4"
        :class="cat.activo ? 'border-slate-200/90' : 'border-slate-200 opacity-60 bg-slate-50/50'"
      >
        <!-- Title and Main Toggle -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <SparklesIcon v-if="cat.siempre_disponible" class="w-5 h-5 text-purple-600" />
              <SunIcon v-else-if="cat.nombre.toLowerCase().includes('desayuno')" class="w-5 h-5 text-amber-500" />
              <FireIcon v-else-if="cat.nombre.toLowerCase().includes('almuerzo')" class="w-5 h-5 text-brand-primary" />
              <MoonIcon v-else-if="cat.nombre.toLowerCase().includes('cena')" class="w-5 h-5 text-indigo-500" />
              <BuildingStorefrontIcon v-else class="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">{{ cat.nombre }}</h3>
              <span class="text-[11px] text-slate-400 font-mono">ID: {{ cat.id.substring(0, 8) }}</span>
            </div>
          </div>

          <!-- Active toggle switch -->
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-xs font-semibold" :class="cat.activo ? 'text-emerald-600' : 'text-slate-400'">
              {{ cat.activo ? 'Activa' : 'Inactiva' }}
            </span>
            <input
              type="checkbox"
              :checked="cat.activo"
              @change="handleToggleActive(cat.id, cat.nombre)"
              class="toggle toggle-sm toggle-success"
            />
          </label>
        </div>

        <!-- Schedule Configuration -->
        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs">
          <!-- 24/7 Switch -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div>
              <span class="font-semibold text-slate-800">Servicio Continuo 24/7</span>
              <p class="text-[10px] text-slate-500">Visible a toda hora sin importar el turno</p>
            </div>
            <input
              type="checkbox"
              :checked="cat.siempre_disponible"
              @change="handleToggle247(cat)"
              class="checkbox checkbox-sm checkbox-primary rounded"
            />
          </div>

          <!-- Time Inputs (disabled if 24/7) -->
          <div v-if="!cat.siempre_disponible" class="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label class="flex items-center gap-1 font-medium text-slate-600 mb-1">
                <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                <span>Hora de Inicio</span>
              </label>
              <input
                type="time"
                :value="cat.hora_inicio.substring(0, 5)"
                @change="handleUpdateSchedule(cat, 'hora_inicio', ($event.target as HTMLInputElement).value)"
                class="input input-xs w-full bg-white border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label class="flex items-center gap-1 font-medium text-slate-600 mb-1">
                <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                <span>Hora de Cierre</span>
              </label>
              <input
                type="time"
                :value="cat.hora_fin.substring(0, 5)"
                @change="handleUpdateSchedule(cat, 'hora_fin', ($event.target as HTMLInputElement).value)"
                class="input input-xs w-full bg-white border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div v-else class="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg font-medium flex items-center gap-2">
            <SparklesIcon class="w-4 h-4 text-amber-600 shrink-0" />
            <span>Esta carta se encuentra permanentemente activa en la carta pública.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
