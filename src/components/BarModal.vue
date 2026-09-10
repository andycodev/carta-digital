<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAudioController } from '@/composables/useAudioController'
import {
  SparklesIcon,
  XMarkIcon,
  ArrowRightIcon,
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
const isVideoMuted = ref(false) // Al abrir, el video busca reproducir con AUDIO

// Estados para deslizamiento hacia abajo (Swipe down to dismiss)
const isDragging = ref(false)
const isClosing = ref(false)
const dragOffsetY = ref(0)
let startY = 0
let startX = 0
let startTime = 0
let isMouseDown = false

/** Alterna el mute del video y coordina con la música ambiental */
function toggleVideoMute() {
  if (!videoRef.value) return

  if (isVideoMuted.value) {
    // Quitar mute → activar audio del video → pausar música ambiental
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

function openModal() {
  dragOffsetY.value = 0
  isClosing.value = false
  isDragging.value = false

  // 1. Pausar inmediatamente la música de la carta principal
  activateVideoAudio()

  if (modalRef.value) {
    modalRef.value.showModal()
  } else {
    const dialog = document.getElementById('modal_bar') as HTMLDialogElement
    dialog?.showModal()
  }

  // 2. Iniciar el video desde el segundo 0 con AUDIO
  if (videoRef.value) {
    videoRef.value.currentTime = 0
    videoRef.value.muted = false
    isVideoMuted.value = false

    const playPromise = videoRef.value.play()
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn('Autoplay con audio restringido por políticas del navegador:', err)
        // Fallback suave en caso de que el navegador exija mute estricto
        if (videoRef.value) {
          videoRef.value.muted = true
          isVideoMuted.value = true
          deactivateVideoAudio()
          videoRef.value.play().catch(() => {})
        }
      })
    }
  }
}

function actuallyCloseModal() {
  // 1. Detener el video y apagar su audio
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    videoRef.value.muted = true
    isVideoMuted.value = true
  }

  // 2. Reanudar la música de la carta si estaba activa antes de abrir el modal
  deactivateVideoAudio()

  if (modalRef.value && modalRef.value.open) {
    modalRef.value.close()
  } else {
    const dialog = document.getElementById('modal_bar') as HTMLDialogElement
    if (dialog && dialog.open) dialog.close()
  }
}

/** Cierra el modal con una animación suave de descenso */
function closeModal(animated = true) {
  if (isClosing.value) return

  if (animated) {
    isClosing.value = true
    dragOffsetY.value = window.innerHeight || 800
    setTimeout(() => {
      actuallyCloseModal()
      isClosing.value = false
      dragOffsetY.value = 0
    }, 280)
  } else {
    actuallyCloseModal()
    dragOffsetY.value = 0
  }
}

function handleNativeClose() {
  actuallyCloseModal()
}

function goToBarCategory(filterQuery?: string) {
  closeModal(true)
  if (props.barCategoryId) {
    emit('navigate-to-bar', props.barCategoryId)
  }
  // Navega directamente a la carta del bar con o sin filtro de categoría
  if (filterQuery) {
    router.push({ path: '/bar', query: { q: filterQuery } })
  } else {
    router.push('/bar')
  }
}

function handleMusicClick() {
  // Si el video está silenciado, activamos su sonido en vivo
  if (isVideoMuted.value) {
    toggleVideoMute()
  } else {
    goToBarCategory()
  }
}

/* ═════════════════════════════════════════════════════════════
   GESTOS TÁCTILES Y ARRASTRE PARA DESLIZAR HACIA ABAJO (SWIPE)
   ═════════════════════════════════════════════════════════════ */
function onTouchStart(e: TouchEvent) {
  if (!e.touches[0]) return
  startY = e.touches[0].clientY
  startX = e.touches[0].clientX
  startTime = Date.now()
  isDragging.value = false
}

function onTouchMove(e: TouchEvent) {
  if (!e.touches[0]) return
  const currentY = e.touches[0].clientY
  const currentX = e.touches[0].clientX
  const deltaY = currentY - startY
  const deltaX = Math.abs(currentX - startX)

  // Solo si se desliza hacia abajo y el movimiento es predominantemente vertical
  if (deltaY > 6 && deltaY > deltaX) {
    isDragging.value = true
    dragOffsetY.value = Math.max(0, deltaY)
    if (e.cancelable) {
      e.preventDefault()
    }
  }
}

function onTouchEnd() {
  if (!isDragging.value) return
  isDragging.value = false

  const elapsed = Date.now() - startTime
  const velocity = dragOffsetY.value / Math.max(elapsed, 1)

  // Si deslizó más de 80px o hizo un movimiento rápido hacia abajo
  if (dragOffsetY.value > 80 || velocity > 0.4) {
    closeModal(true)
  } else {
    dragOffsetY.value = 0
  }
}

/* Soporte de arrastre con ratón en desktop */
function onMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement)?.closest('button, a')) return
  isMouseDown = true
  startY = e.clientY
  startTime = Date.now()
  isDragging.value = false
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isMouseDown) return
  const deltaY = e.clientY - startY
  if (deltaY > 5) {
    isDragging.value = true
    dragOffsetY.value = Math.max(0, deltaY)
  }
}

function onMouseUp() {
  if (!isMouseDown) return
  isMouseDown = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)

  if (!isDragging.value) return
  isDragging.value = false

  const elapsed = Date.now() - startTime
  const velocity = dragOffsetY.value / Math.max(elapsed, 1)

  if (dragOffsetY.value > 80 || velocity > 0.4) {
    closeModal(true)
  } else {
    dragOffsetY.value = 0
  }
}

function onVisibilityChange() {
  if (document.hidden && modalRef.value?.open && videoRef.value) {
    videoRef.value.pause()
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

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

    <!-- ═══════════════════════════════════════════════════════
         MODAL ENVOLVENTE TIPO TIKTOK / REELS (DESLIZABLE HACIA ABAJO)
         ═══════════════════════════════════════════════════════════ -->
    <dialog id="modal_bar" ref="modalRef" @close="handleNativeClose"
      class="modal modal-bottom sm:modal-middle bg-slate-950/85 backdrop-blur-md p-0 sm:p-4">
      
      <div
        class="modal-box relative !p-0 !bg-black text-white border-0 sm:border sm:border-amber-500/40 w-full sm:max-w-md h-[95vh] sm:h-[90vh] max-h-[96vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col select-none ring-1 ring-white/15 will-change-transform"
        :style="{
          transform: dragOffsetY > 0 || isClosing ? `translateY(${dragOffsetY}px)` : 'translateY(0)',
          opacity: isClosing ? 0.2 : 1,
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease'
        }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
        @mousedown="onMouseDown">

        <!-- Barra indicadora superior de agarre para deslizar hacia abajo -->
        <div class="absolute top-2 left-0 right-0 z-40 flex justify-center py-1 cursor-grab active:cursor-grabbing pointer-events-auto">
          <div class="w-12 h-1.5 rounded-full bg-white/40 hover:bg-white/70 active:bg-white/90 transition-all shadow-sm"></div>
        </div>

        <!-- ═══════════════════════════════════════════════════════
             FONDO AMBIENTAL DE VIDEO DIFUMINADO (Elimina franjas vacías)
             ═══════════════════════════════════════════════════════════ -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none -z-0">
          <video src="/videos/bar-promo.mp4" poster="/videos/bar-poster.jpg"
            autoplay loop muted playsinline aria-hidden="true"
            class="w-full h-full object-cover blur-3xl scale-125 opacity-35 transform-gpu">
          </video>
          <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        </div>

        <!-- ═══════════════════════════════════════════════════════
             REELS VIEWER: VIDEO VERTICAL FULL-HEIGHT
             ═══════════════════════════════════════════════════════════ -->
        <div class="relative z-10 w-full h-full flex items-center justify-center overflow-hidden bg-black">
          
          <!-- Video Vertical 9:16 Ocupando todo el alto disponible (sin pantalla completa invasiva) -->
          <video ref="videoRef" src="/videos/bar-promo.mp4" poster="/videos/bar-poster.jpg"
            loop playsinline webkit-playsinline x5-playsinline preload="auto"
            disablepictureinpicture controlslist="nodownload nofullscreen noremoteplayback"
            @dblclick.prevent.stop
            @contextmenu.prevent
            class="w-full h-full object-cover sm:object-contain">
            Tu navegador no soporta video.
          </video>

          <!-- ═══════════════════════════════════════════════════════
               HEADER FLOTANTE SUPERIOR (Estilo Stories / TikTok)
               ═══════════════════════════════════════════════════════════ -->
          <div class="absolute top-0 left-0 right-0 z-30 flex items-center justify-between pt-5 pb-3 px-3.5 sm:px-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
            <!-- Brand Badge -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 p-0.5 flex items-center justify-center shadow-md">
                <span class="text-sm">🍸</span>
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-black text-white tracking-wide">Las Delicias</span>
                  <span class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 uppercase shadow-xs">
                    Bar & Coctelería
                  </span>
                </div>
                <p class="text-[10px] text-amber-300 font-medium">Al fondo del restaurante</p>
              </div>
            </div>

            <!-- Controles de cabecera -->
            <div class="flex items-center gap-2">
              <!-- Botón Toggle Audio del Video -->
              <button type="button" @click.stop="toggleVideoMute"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-200 cursor-pointer border backdrop-blur-md shadow-md"
                :class="isVideoMuted
                  ? 'bg-black/70 text-slate-300 border-white/20 hover:bg-black/90'
                  : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-amber-500/40 font-black'">
                <SpeakerXMarkIcon v-if="isVideoMuted" class="w-3.5 h-3.5" />
                <SpeakerWaveIcon v-else class="w-3.5 h-3.5 animate-pulse" />
                <span>{{ isVideoMuted ? 'Mudo' : 'Audio' }}</span>
              </button>

              <!-- Close Button (X) con suave descenso -->
              <button type="button" @click.stop="closeModal(true)"
                class="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md"
                aria-label="Cerrar modal">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════
               BARRA LATERAL DE ACCIONES RÁPIDAS (Estilo TikTok / Reels)
               ═══════════════════════════════════════════════════════════ -->
          <div class="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3">
            
            <!-- 🍺 Cervezas -->
            <button type="button" @click.stop="goToBarCategory('cerveza')"
              class="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 group-hover:border-amber-400 group-hover:bg-amber-500/30 flex items-center justify-center text-xl shadow-xl transition-all group-hover:scale-110">
                🍺
              </div>
              <span class="text-[10px] font-bold text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">Cervezas</span>
            </button>

            <!-- 🍹 Tragos -->
            <button type="button" @click.stop="goToBarCategory('trago')"
              class="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 group-hover:border-orange-400 group-hover:bg-orange-500/30 flex items-center justify-center text-xl shadow-xl transition-all group-hover:scale-110">
                🍹
              </div>
              <span class="text-[10px] font-bold text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">Tragos</span>
            </button>

            <!-- 🍽️ Piqueos -->
            <button type="button" @click.stop="goToBarCategory('piqueo')"
              class="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 group-hover:border-emerald-400 group-hover:bg-emerald-500/30 flex items-center justify-center text-xl shadow-xl transition-all group-hover:scale-110">
                🍽️
              </div>
              <span class="text-[10px] font-bold text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">Piqueos</span>
            </button>

            <!-- 🎵 Música / Audio -->
            <button type="button" @click.stop="handleMusicClick"
              class="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 group-hover:border-purple-400 group-hover:bg-purple-500/30 flex items-center justify-center text-xl shadow-xl transition-all group-hover:scale-110"
                :class="{ 'ring-2 ring-purple-400 animate-pulse': !isVideoMuted }">
                🎵
              </div>
              <span class="text-[10px] font-bold text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">Música</span>
            </button>

            <!-- 🍷 Vinos -->
            <button type="button" @click.stop="goToBarCategory('vino')"
              class="flex flex-col items-center group cursor-pointer active:scale-90 transition-transform">
              <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/25 group-hover:border-rose-400 group-hover:bg-rose-500/30 flex items-center justify-center text-xl shadow-xl transition-all group-hover:scale-110">
                🍷
              </div>
              <span class="text-[10px] font-bold text-white mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight">Vinos</span>
            </button>
          </div>

          <!-- ═══════════════════════════════════════════════════════
               FOOTER FLOTANTE INFERIOR: TEXTO PERSUASIVO Y BOTÓN CTA
               ═══════════════════════════════════════════════════════════ -->
          <div class="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/80 via-60% to-transparent flex flex-col gap-2">
            
            <!-- Hook Badge -->
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 backdrop-blur-sm shadow-sm">
                <span>🍻 Un espacio diferente te espera</span>
              </span>
            </div>

            <!-- Título -->
            <h3 class="text-base sm:text-lg font-black text-white tracking-tight leading-tight drop-shadow-md pr-14">
              Al fondo de Las Delicias Restobar
            </h3>

            <!-- Persuasive Caption -->
            <p class="text-xs text-slate-200 leading-snug line-clamp-2 drop-shadow pr-14">
              No te quedes solo con el almuerzo… pasa al fondo y descubre un espacio perfecto para relajarte, conversar y disfrutar de un buen momento.
            </p>

            <!-- Botón Principal: Explorar Carta del Bar -->
            <button id="btn-modal-view-bar" type="button" @click.stop="goToBarCategory()"
              class="mt-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-amber-500/30 text-xs sm:text-sm py-3 min-h-[44px] flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-95 cursor-pointer">
              <span>Explorar Carta del Bar</span>
              <ArrowRightIcon class="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </div>

      <!-- Backdrop click to close con transición suave -->
      <form method="dialog" class="modal-backdrop">
        <button @click.prevent="closeModal(true)">close</button>
      </form>
    </dialog>
  </div>
</template>
