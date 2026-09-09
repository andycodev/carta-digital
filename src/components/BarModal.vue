<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAudioController } from '@/composables/useAudioController'
import {
  SparklesIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  barCategoryId?: string
}>()

const emit = defineEmits<{
  (e: 'navigate-to-bar', barCatId: string): void
}>()

const router = useRouter()
const { activateVideoAudio, deactivateVideoAudio } = useAudioController()

const modalRef = ref<HTMLDialogElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const videoContainerRef = ref<HTMLDivElement | null>(null)
const isFullscreen = ref(false)
const isVideoMuted = ref(true) // El video siempre inicia en silencio

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    videoContainerRef.value?.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(err => {
      console.log('Error al entrar en pantalla completa:', err)
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(err => {
      console.log('Error al salir de pantalla completa:', err)
    })
  }
}

/** Alterna el mute del video y coordina con la música ambiental */
function toggleVideoMute() {
  if (!videoRef.value) return

  if (isVideoMuted.value) {
    // Quitar mute → el video tendrá audio → pausar música ambiental
    videoRef.value.muted = false
    isVideoMuted.value = false
    activateVideoAudio()
  } else {
    // Silenciar video → reanudar música ambiental
    videoRef.value.muted = true
    isVideoMuted.value = true
    deactivateVideoAudio()
  }
}

// Escuchar cambios de pantalla completa
if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
}

function openModal() {
  if (modalRef.value) {
    modalRef.value.showModal()
  } else {
    const dialog = document.getElementById('modal_bar') as HTMLDialogElement
    dialog?.showModal()
  }
  // Reiniciar video desde el inicio siempre en MUTE para no interferir con música ambiental
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.muted = true
    isVideoMuted.value = true
    videoRef.value.play().catch(err => console.log('Autoplay bloqueado:', err))
  }
}

function closeModal() {
  // Silenciar y pausar el video + notificar que el audio del video ya no está activo
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.muted = true
    isVideoMuted.value = true
  }
  // Liberar el audio para que la música ambiental pueda reanudar
  deactivateVideoAudio()

  if (modalRef.value) {
    modalRef.value.close()
  } else {
    const dialog = document.getElementById('modal_bar') as HTMLDialogElement
    dialog?.close()
  }
}

function goToBarCategory() {
  closeModal()
  if (props.barCategoryId) {
    emit('navigate-to-bar', props.barCategoryId)
  }
  // Navega directamente a la carta dedicada del bar
  router.push('/bar')
}

defineExpose({
  openModal,
  closeModal
})
</script>

<template>
  <div>
    <!-- Floating Bottom Promo Button -->
    <div class="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-30">
      <button id="btn-open-bar-modal" type="button" @click="openModal"
        class="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-xl hover:shadow-2xl rounded-full px-4 py-2.5 sm:px-5 sm:py-3 flex items-center gap-2 group transition-all duration-200 hover:scale-105 active:scale-95 border border-amber-400/40 backdrop-blur-md text-xs sm:text-sm cursor-pointer ring-2 ring-amber-500/20">
        <span class="text-base group-hover:rotate-12 transition-transform duration-200">🍸</span>
        <span class="tracking-tight">Descubre lo que tenemos al fondo</span>
        <SparklesIcon class="w-4 h-4 text-amber-300 animate-pulse" />
      </button>
    </div>

    <!-- Native DaisyUI Modal Dialog -->
    <dialog id="modal_bar" ref="modalRef" class="modal modal-bottom sm:modal-middle bg-slate-950/70 backdrop-blur-md">
      <div
        class="modal-box !bg-white border border-slate-200/90 p-0 max-w-xl overflow-hidden shadow-2xl rounded-t-3xl sm:rounded-3xl text-slate-900 max-h-[92vh] flex flex-col">

        <!-- Close button on top-right -->
        <button type="button" @click="closeModal"
          class="btn btn-sm btn-circle absolute right-3.5 top-3.5 z-30 text-white bg-black/60 hover:bg-black/90 border border-white/20 shadow-lg cursor-pointer backdrop-blur-sm"
          aria-label="Cerrar modal">
          <XMarkIcon class="w-5 h-5" />
        </button>

        <!-- Fullscreen toggle button on top-left -->
        <button type="button" @click="toggleFullscreen"
          class="btn btn-sm btn-circle absolute left-3.5 top-3.5 z-30 text-white bg-black/60 hover:bg-black/90 border border-white/20 shadow-lg cursor-pointer backdrop-blur-sm"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'" aria-label="Pantalla completa">
          <ArrowsPointingInIcon v-if="isFullscreen" class="w-5 h-5" />
          <ArrowsPointingOutIcon v-else class="w-5 h-5" />
        </button>

        <!-- Scrollable Content Wrapper -->
        <div class="overflow-y-auto no-scrollbar flex-1">
          <!-- Video Player Showcase (Hero Completo sin zoom forzado) -->
          <div ref="videoContainerRef"
            class="relative w-full bg-slate-950 overflow-hidden flex items-center justify-center group border-b border-slate-200/80 min-h-[220px] max-h-[50vh]">
            <!-- Fondo difuminado ambiental en tiempo real (evita barras negras duras) -->
            <video src="/videos/bar-promo.mp4" autoplay loop muted playsinline aria-hidden="true"
              class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-35 scale-110 pointer-events-none">
            </video>

            <!-- Video principal sin recorte ni zoom artificial (100% completo) -->
            <video ref="videoRef" src="/videos/bar-promo.mp4" autoplay loop muted playsinline preload="auto"
              class="relative z-10 w-full h-auto max-h-[48vh] object-contain mx-auto">
              Tu navegador no soporta el elemento de video.
            </video>

            <!-- Gradient overlays sutiles en los extremos -->
            <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-15"></div>
            <div class="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-15"></div>

            <!-- Video badge & Live indicator -->
            <div class="absolute bottom-3 left-4 flex items-center gap-2 z-20 pointer-events-none">
              <span
                class="bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
                <span>Ambiente en vivo</span>
              </span>
            </div>

            <!-- Botón toggle audio del video -->
            <button type="button" @click="toggleVideoMute"
              class="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border backdrop-blur-md shadow-lg"
              :class="isVideoMuted
                ? 'bg-black/60 text-white border-white/30 hover:bg-black/80'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-amber-500/30 animate-pulse'"
              :title="isVideoMuted ? 'Activar audio del video' : 'Silenciar video'">
              <SpeakerXMarkIcon v-if="isVideoMuted" class="w-4 h-4" />
              <SpeakerWaveIcon v-else class="w-4 h-4" />
              <span>{{ isVideoMuted ? 'Activar audio' : 'Con audio' }}</span>
            </button>
          </div>

          <!-- Modal Text Content & Persuasive Copy (High Contrast, Ultra-Legible) -->
          <div class="p-5 sm:p-6 space-y-4">
            <!-- Header Hook -->
            <div>
              <div
                class="inline-flex items-center gap-1.5 text-amber-900 bg-amber-100 border border-amber-300/80 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 shadow-2xs">
                <span>🍻 Un espacio diferente te espera</span>
              </div>

              <h3 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Al fondo de Las Delicias Restobar
              </h3>

              <p class="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
                Tenemos un espacio pensado para que disfrutes un momento diferente junto a tus amigos.
              </p>
            </div>

            <!-- Feature Chips Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div
                class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 transition-all shadow-2xs">
                <span class="text-base shrink-0">🍺</span>
                <span class="text-xs font-bold text-slate-800">Cervezas</span>
              </div>
              <div
                class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 transition-all shadow-2xs">
                <span class="text-base shrink-0">🍹</span>
                <span class="text-xs font-bold text-slate-800 truncate">Tragos</span>
              </div>
              <div
                class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 transition-all shadow-2xs">
                <span class="text-base shrink-0">🍢</span>
                <span class="text-xs font-bold text-slate-800">Piqueos</span>
              </div>
              <div
                class="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 transition-all shadow-2xs">
                <span class="text-base shrink-0">🎶</span>
                <span class="text-xs font-bold text-slate-800">Buena música</span>
              </div>
              <div
                class="col-span-2 sm:col-span-2 flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50/80 border border-orange-200 shadow-2xs">
                <span class="text-base shrink-0">✨</span>
                <span class="text-xs font-extrabold text-orange-950">Ambiente ideal para compartir y disfrutar</span>
              </div>
            </div>

            <!-- Persuasive Hook Box -->
            <div
              class="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50/40 border border-orange-200/90 shadow-2xs relative overflow-hidden">
              <p class="relative z-10 italic text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                “No te quedes solo con el almuerzo… pasa al fondo y descubre un espacio perfecto para relajarte,
                conversar y disfrutar de un buen momento.”
              </p>
            </div>

            <!-- Modal Action Buttons -->
            <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button id="btn-modal-view-bar" type="button" @click="goToBarCategory"
                class="btn w-full sm:flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-2xl border-none shadow-md hover:shadow-lg text-xs sm:text-sm py-3.5 min-h-[48px] flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer">
                <span>Explorar Carta del Bar</span>
                <ArrowRightIcon class="w-4 h-4 text-white stroke-2" />
              </button>

              <button type="button" @click="closeModal"
                class="btn btn-ghost w-full sm:w-auto text-slate-600 hover:text-slate-900 rounded-2xl text-xs sm:text-sm cursor-pointer font-bold">
                Continuar viendo la carta
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop click to close -->
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">close</button>
      </form>
    </dialog>
  </div>
</template>
