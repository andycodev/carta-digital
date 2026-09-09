<script setup lang="ts">
import { ref } from 'vue'
import { useAudioController } from '@/composables/useAudioController'
import { SparklesIcon, XMarkIcon, ArrowRightIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  barCategoryId?: string
}>()

const emit = defineEmits<{
  (e: 'navigate-to-bar', barCatId: string): void
}>()

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
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

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
}

defineExpose({
  openModal,
  closeModal
})
</script>

<template>
  <div>
    <!-- Floating Bottom Promo Bar -->
    <div class="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-30">
      <button id="btn-open-bar-modal" type="button" @click="openModal"
        class="bg-slate-900/95 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center gap-1.5 group transition-all duration-150 hover:scale-105 active:scale-95 border border-slate-700/80 backdrop-blur-xs text-xs cursor-pointer">
        <SparklesIcon class="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-150" />
        <span class="font-medium tracking-tight">descubre lo que hay al fondo</span>
      </button>
    </div>

    <!-- Native DaisyUI Modal Dialog -->
    <dialog id="modal_bar" ref="modalRef" class="modal modal-bottom sm:modal-middle bg-slate-950/60 backdrop-blur-sm">
      <div
        class="modal-box bg-white border border-slate-200 p-0 max-w-2xl overflow-hidden shadow-2xl rounded-3xl text-slate-800 sm:rounded-3xl rounded-none h-screen sm:h-auto max-h-screen">
        <!-- Close button on top-right -->
        <button type="button" @click="closeModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-3.5 top-3.5 z-20 text-white bg-slate-900/60 hover:bg-slate-900/80 border-none shadow-sm cursor-pointer">
          <XMarkIcon class="w-5 h-5" />
        </button>

        <!-- Fullscreen toggle button -->
        <button type="button" @click="toggleFullscreen"
          class="btn btn-sm btn-circle btn-ghost absolute left-3.5 top-3.5 z-20 text-white bg-slate-900/60 hover:bg-slate-900/80 border-none shadow-sm cursor-pointer"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'">
          <ArrowsPointingInIcon v-if="isFullscreen" class="w-5 h-5" />
          <ArrowsPointingOutIcon v-else class="w-5 h-5" />
        </button>

        <!-- Video Player Showcase -->
        <div ref="videoContainerRef"
          class="relative w-full aspect-[4/3] sm:aspect-video bg-black overflow-hidden flex items-center justify-center">
          <!-- Video local — siempre inicia en mute para no competir con la música -->
          <video ref="videoRef" src="/videos/bar-promo.mp4" autoplay loop muted playsinline preload="auto"
            class="w-full h-full object-contain bg-black">
            Tu navegador no soporta el elemento de video.
          </video>

          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none">
          </div>

          <!-- Video badge -->
          <div class="absolute bottom-3 left-4 flex items-center gap-1.5">
            <span
              class="badge bg-amber-500 text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
              <SparklesIcon class="w-3 h-3" />
              <span>En Vivo • Mixología</span>
            </span>
          </div>

          <!-- Botón toggle audio del video (bottom-right del video) -->
          <button
            type="button"
            @click="toggleVideoMute"
            class="absolute bottom-3 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 cursor-pointer border"
            :class="isVideoMuted
              ? 'bg-black/50 text-slate-300 border-white/20 hover:bg-black/70 hover:text-white'
              : 'bg-amber-500/90 text-white border-amber-400 hover:bg-amber-500 shadow-md'"
            :title="isVideoMuted ? 'Activar audio del video (pausa música)' : 'Silenciar video (reanuda música)'"
          >
            <SpeakerXMarkIcon v-if="isVideoMuted" class="w-3.5 h-3.5" />
            <SpeakerWaveIcon v-else class="w-3.5 h-3.5 animate-pulse" />
            <span class="hidden sm:inline">{{ isVideoMuted ? 'Sin audio' : 'Con audio' }}</span>
          </button>
        </div>

        <!-- Modal Text Content -->
        <div class="p-5 sm:p-6">
          <div class="flex items-center gap-1.5 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <SparklesIcon class="w-3.5 h-3.5" />
            <span>Las Delicias Restobar</span>
          </div>

          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Descubre lo que hay al fondo
          </h3>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            Disfruta de nuestra selección de cócteles artesanales, macerados especiales, destilados premium y opciones
            sin alcohol. ¡Servicio continuo!
          </p>

          <!-- Modal Action buttons -->
          <div class="flex flex-col sm:flex-row items-center gap-2.5">
            <button id="btn-modal-view-bar" type="button" @click="goToBarCategory"
              class="btn btn-primary w-full sm:flex-1 bg-brand-primary hover:bg-brand-primary-hover border-none text-white font-bold rounded-xl shadow-md text-xs sm:text-sm py-2.5 flex items-center justify-center gap-1.5 cursor-pointer">
              <span>Explorar Carta del Bar</span>
              <ArrowRightIcon class="w-4 h-4" />
            </button>

            <button type="button" @click="closeModal"
              class="btn btn-ghost w-full sm:w-auto text-slate-600 hover:text-slate-900 rounded-xl text-xs sm:text-sm cursor-pointer">
              Continuar viendo carta
            </button>
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
