<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import { useAudioController } from '@/composables/useAudioController'
import { MusicalNoteIcon, SpeakerWaveIcon } from '@heroicons/vue/24/outline'

const { config } = useMenuStore()
const { videoAudioActive } = useAudioController()

const props = defineProps<{
  darkMode?: boolean
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const hasError = ref(false)

// Bandera para saber si la música fue pausada por el video (no por el usuario)
const pausedByVideo = ref(false)

const STORAGE_KEY_MUSIC_PREF = 'delicias_user_wants_music'

// ── Controles públicos (expuestos para uso externo si hace falta) ──────────────

function pauseMusic() {
  if (audioRef.value && isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
    pausedByVideo.value = true
  }
}

function resumeMusic() {
  if (audioRef.value && pausedByVideo.value && config.value.musica_activa) {
    audioRef.value.volume = (config.value.musica_volumen || 35) / 100
    audioRef.value.play()
      .then(() => {
        isPlaying.value = true
        pausedByVideo.value = false
        hasError.value = false
      })
      .catch(() => {
        pausedByVideo.value = false
      })
  }
}

defineExpose({ pauseMusic, resumeMusic })

// ── Watcher: coordinar con audio del video ────────────────────────────────────

watch(videoAudioActive, (videoOn) => {
  if (videoOn) {
    pauseMusic()
  } else {
    resumeMusic()
  }
})

// ── Toggle manual del usuario ─────────────────────────────────────────────────

function toggleMusic() {
  if (!audioRef.value || !config.value.musica_url) return

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
    pausedByVideo.value = false
    sessionStorage.setItem(STORAGE_KEY_MUSIC_PREF, 'false')
  } else {
    audioRef.value.volume = (config.value.musica_volumen || 35) / 100
    audioRef.value
      .play()
      .then(() => {
        isPlaying.value = true
        hasError.value = false
        pausedByVideo.value = false
        sessionStorage.setItem(STORAGE_KEY_MUSIC_PREF, 'true')
      })
      .catch(err => {
        console.warn('Audio playback blocked or failed:', err)
        hasError.value = true
        isPlaying.value = false
      })
  }
}

// ── Watchers de config ────────────────────────────────────────────────────────

watch(() => config.value.musica_volumen, (newVol) => {
  if (audioRef.value) {
    audioRef.value.volume = (newVol || 35) / 100
  }
})

watch(() => config.value.musica_url, () => {
  if (audioRef.value && isPlaying.value) {
    audioRef.value.pause()
    audioRef.value.load()
    audioRef.value.play().catch(() => {
      isPlaying.value = false
    })
  }
})

// ── Activación en primer scroll / interacción ─────────────────────────────────

/**
 * Intenta iniciar la música ambiental.
 * Llamado tanto en el primer scroll como en el primer click/touch.
 * Solo activa si el usuario no ha dicho explícitamente que no quiere música.
 */
function tryStartMusic() {
  if (!audioRef.value || isPlaying.value || !config.value.musica_activa) return
  const pref = sessionStorage.getItem(STORAGE_KEY_MUSIC_PREF)
  if (pref === 'false') return

  // Si el video tiene audio activo, no iniciamos la música
  if (videoAudioActive.value) return

  audioRef.value.volume = (config.value.musica_volumen || 35) / 100
  audioRef.value.muted = false
  audioRef.value.play()
    .then(() => {
      isPlaying.value = true
      hasError.value = false
      pausedByVideo.value = false
      sessionStorage.setItem(STORAGE_KEY_MUSIC_PREF, 'true')
    })
    .catch(() => { /* Bloqueado — se intentará en siguiente interacción */ })
}

function handleFirstInteraction() {
  tryStartMusic()
  // Remover todos los listeners de primera interacción
  document.removeEventListener('click', handleFirstInteraction, { capture: true })
  document.removeEventListener('touchstart', handleFirstInteraction, { capture: true })
  document.removeEventListener('keydown', handleFirstInteraction, { capture: true })
}

// El scroll tiene su propio listener para QR/acceso directo (primer scroll activa sin necesidad de click)
function handleFirstScroll() {
  tryStartMusic()
  document.removeEventListener('scroll', handleFirstScroll, { capture: true })
}

// ── Montaje: intentar autoplay ────────────────────────────────────────────────

onMounted(() => {
  if (!audioRef.value) return

  audioRef.value.volume = (config.value.musica_volumen || 35) / 100

  if (!config.value.musica_activa) return

  const pref = sessionStorage.getItem(STORAGE_KEY_MUSIC_PREF)
  if (pref === 'false') return

  // Estrategia: intentar autoplay muted → desmutar 100ms después.
  // Esta técnica funciona incluso en navegadores modernos sin interacción previa.
  audioRef.value.muted = true
  audioRef.value.play()
    .then(() => {
      isPlaying.value = true
      hasError.value = false
      sessionStorage.setItem(STORAGE_KEY_MUSIC_PREF, 'true')

      // Desmutar inmediatamente (el navegador ya aceptó el autoplay)
      setTimeout(() => {
        if (audioRef.value && isPlaying.value) {
          audioRef.value.muted = false
        }
      }, 100)
    })
    .catch(() => {
      // Autoplay completamente bloqueado → activar en primer scroll o interacción.
      // El scroll cubre el caso de acceso por QR/enlace directo.
      document.addEventListener('scroll', handleFirstScroll, { capture: true, once: true })
      document.addEventListener('click', handleFirstInteraction, { capture: true, once: true })
      document.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true })
      document.addEventListener('keydown', handleFirstInteraction, { capture: true, once: true })
    })
})

onUnmounted(() => {
  document.removeEventListener('scroll', handleFirstScroll, { capture: true })
  document.removeEventListener('click', handleFirstInteraction, { capture: true })
  document.removeEventListener('touchstart', handleFirstInteraction, { capture: true })
  document.removeEventListener('keydown', handleFirstInteraction, { capture: true })
})
</script>

<template>
  <div v-if="config.musica_activa" class="inline-flex items-center">
    <audio ref="audioRef" :src="config.musica_url" loop preload="none" @ended="isPlaying = false"></audio>

    <button type="button" @click="toggleMusic"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer"
      :class="[
        isPlaying
          ? darkMode
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
          : darkMode
            ? 'bg-white/10 text-slate-400 border-white/15 hover:bg-white/20'
            : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
      ]" :title="isPlaying ? 'Pausar música ambiental' : 'Reproducir música ambiental'"
      aria-label="Control de música ambiental">
      <SpeakerWaveIcon v-if="isPlaying"
        :class="['w-3.5 h-3.5', darkMode ? 'text-amber-400 animate-pulse' : 'text-amber-700 animate-pulse']" />
      <MusicalNoteIcon v-else :class="['w-3.5 h-3.5', darkMode ? 'text-slate-400' : 'text-slate-500']" />

      <span class="text-[11px] font-medium hidden sm:inline">
        {{ isPlaying ? 'Música activa' : 'Música' }}
      </span>
    </button>
  </div>
</template>
