<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import {
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

withDefaults(defineProps<{
  sourceMenu?: 'main' | 'bar'
}>(), {
  sourceMenu: 'main'
})

const { config } = useMenuStore()
const errorMessage = ref<string | null>(null)

// Validación estricta del enlace dinámico configurado por el administrador
const isValidGroupUrl = computed(() => {
  const url = (config.value.whatsapp_group_url || '').trim()
  if (!url) return false
  // Prohibir enlaces de ejemplo o texto simulado
  if (url.includes('EXAMPLE') || url.includes('FLX38a7Z4lC4b6EXAMPLE')) return false
  return url.startsWith('http://') || url.startsWith('https://')
})

function handleJoinGroup() {
  errorMessage.value = null
  const url = (config.value.whatsapp_group_url || '').trim()

  if (!isValidGroupUrl.value || !url) {
    errorMessage.value = 'El grupo de WhatsApp no está disponible por el momento.'
    return
  }

  try {
    // Abrir directamente el enlace oficial del grupo configurado
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err) {
    console.error('Error al abrir el enlace del grupo:', err)
    window.location.href = url
  }
}
</script>

<template>
  <!-- Renderizar solo si la función está habilitada en la configuración -->
  <section
    v-if="config.whatsapp_subscription_enabled !== false"
    class="my-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
  >
    <!-- Contenedor con diseño de alta gama y lectura clara en móvil -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6 text-white">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <!-- Invitación directa y concisa sin solicitar datos -->
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 shadow-inner">
            <ChatBubbleLeftRightIcon class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <h3 class="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>📲 ¡Únete a nuestro grupo de WhatsApp!</span>
            </h3>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Entérate de nuestras promociones, novedades, eventos y ofertas especiales de Las Delicias Restobar.
            </p>
          </div>
        </div>

        <!-- Botón principal directo -->
        <div class="sm:shrink-0 flex flex-col items-stretch sm:items-end gap-2">
          <button
            type="button"
            @click="handleJoinGroup"
            class="btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black border-none rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 px-5 sm:px-6 py-3 shadow-lg shadow-emerald-950/20 active:scale-98 transition-all cursor-pointer"
          >
            <span>📱 Unirme al grupo de WhatsApp</span>
            <ArrowTopRightOnSquareIcon class="w-4 h-4 text-slate-900" />
          </button>
        </div>
      </div>

      <!-- Mensaje claro si no existe enlace configurado o no es válido -->
      <div
        v-if="errorMessage"
        class="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2"
      >
        <ExclamationCircleIcon class="w-4 h-4 shrink-0 text-amber-300" />
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </section>
</template>
