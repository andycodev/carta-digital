<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import {
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

withDefaults(defineProps<{
  sourceMenu?: 'main' | 'bar'
}>(), {
  sourceMenu: 'main'
})

const { config } = useMenuStore()
const errorMessage = ref<string | null>(null)
const isDismissed = ref(false)
let timerId: ReturnType<typeof setTimeout> | null = null

// Limpiar flags persistidos anteriormente para asegurar que siempre esté presente
function clearLegacyDismissal() {
  try {
    sessionStorage.removeItem('wa_badge_dismissed')
    localStorage.removeItem('wa_badge_dismissed')
  } catch {
    // ignore
  }
}

clearLegacyDismissal()

onMounted(() => {
  clearLegacyDismissal()
})

onUnmounted(() => {
  if (timerId) {
    clearTimeout(timerId)
    timerId = null
  }
})

// Obtener el enlace efectivo del grupo de WhatsApp
function resolveWhatsAppTarget(): string | null {
  const groupUrl = (config.value.whatsapp_group_url || '').trim()
  if (groupUrl && groupUrl.startsWith('http') && !groupUrl.includes('EXAMPLE')) {
    return groupUrl
  }

  const phone = (config.value.telefono_whatsapp || '').replace(/\D/g, '')
  if (phone) {
    const intlPhone = phone.startsWith('51') ? phone : `51${phone}`
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent('¡Hola! Deseo unirme al grupo oficial de WhatsApp de Las Delicias Restobar.')}`
  }

  return null
}

function handleJoinGroup() {
  errorMessage.value = null
  const targetUrl = resolveWhatsAppTarget()

  if (!targetUrl) {
    errorMessage.value = 'El grupo de WhatsApp no está disponible por el momento.'
    return
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (isMobile) {
    window.location.href = targetUrl
  } else {
    const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer')
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = targetUrl
    }
  }
}

function dismiss() {
  isDismissed.value = true
  if (timerId) {
    clearTimeout(timerId)
  }
  // Vuelve a aparecer automáticamente después de 10 segundos como estaba
  timerId = setTimeout(() => {
    isDismissed.value = false
    timerId = null
  }, 10000)
}
</script>

<template>
  <!-- Renderizar el banner de WhatsApp siempre que no esté cerrado temporalmente -->
  <transition name="wa-slide">
    <section
      v-if="config.whatsapp_subscription_enabled !== false && !isDismissed"
      class="mt-4 mb-2 rounded-3xl overflow-hidden shadow-lg"
    >
      <!-- Contenedor con diseño premium -->
      <div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4 sm:p-5 text-white border border-emerald-500/20">
        <!-- Decorative glow -->
        <div class="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

        <!-- Close button con área táctil y clic óptimo en móvil y web -->
        <button
          type="button"
          @click.stop.prevent="dismiss"
          class="absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 active:scale-90 transition-all cursor-pointer z-30 touch-manipulation shadow-sm"
          aria-label="Cerrar aviso de WhatsApp"
          title="Cerrar (volverá en 10 segundos)"
        >
          <XMarkIcon class="w-4 h-4 pointer-events-none" />
        </button>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <!-- Invitación -->
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 shadow-inner">
              <ChatBubbleLeftRightIcon class="w-6 h-6" />
            </div>
            <div class="space-y-1 pr-7 sm:pr-0">
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
              class="btn bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black border-none rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 px-5 sm:px-6 py-3 shadow-lg shadow-emerald-950/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>📱 Unirme al grupo de WhatsApp</span>
              <ArrowTopRightOnSquareIcon class="w-4 h-4 text-slate-900" />
            </button>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="errorMessage"
          class="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2 relative z-10"
        >
          <ExclamationCircleIcon class="w-4 h-4 shrink-0 text-amber-300" />
          <span>{{ errorMessage }}</span>
        </div>
      </div>
    </section>
  </transition>
</template>

<style scoped>
.wa-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.wa-slide-leave-active {
  transition: all 0.25s ease-in;
}
.wa-slide-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
.wa-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
