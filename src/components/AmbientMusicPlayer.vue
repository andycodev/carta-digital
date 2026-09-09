<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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

const effectiveMusicUrl = computed(() => {
  return config.value.musica_url || '/audio/ambient.mp3'
})

// ── Controles públicos (expuestos para uso externo si hace falta) ──────────────

function pauseMusic() {
  if (audioRef.value && isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
    pausedByVideo.value = true
  }
}

function resumeMusic() {
  if (audioRef.value && pausedByVideo.value && config.value.musica_activa !== false) {
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
  if (!audioRef.value) return

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

watch(effectiveMusicUrl, () => {
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
 * Llamado en el primer scroll, click, touch o interacción.
 */
function tryStartMusic() {
  if (!audioRef.value || isPlaying.value || config.value.musica_activa === false) return
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
    .catch(() => { /* Bloqueado — se reintentará en siguiente toque */ })
}

function handleFirstInteraction() {
  tryStartMusic()
  removeInteractionListeners()
}

function removeInteractionListeners() {
  document.removeEventListener('scroll', handleFirstInteraction, { capture: true })
  document.removeEventListener('click', handleFirstInteraction, { capture: true })
  document.removeEventListener('touchstart', handleFirstInteraction, { capture: true })
  document.removeEventListener('pointerdown', handleFirstInteraction, { capture: true })
  document.removeEventListener('keydown', handleFirstInteraction, { capture: true })
}

// ── Montaje: intentar autoplay ────────────────────────────────────────────────

onMounted(() => {
  if (!audioRef.value) return

  audioRef.value.volume = (config.value.musica_volumen || 35) / 100

  if (config.value.musica_activa === false) return

  const pref = sessionStorage.getItem(STORAGE_KEY_MUSIC_PREF)
  if (pref === 'false') return

  // Estrategia: intentar autoplay muted → desmutar inmediatamente después.
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
      }, 150)
    })
    .catch(() => {
      // Autoplay bloqueado por política del navegador → activar en primer toque/scroll
      document.addEventListener('scroll', handleFirstInteraction, { capture: true, once: true })
      document.addEventListener('click', handleFirstInteraction, { capture: true, once: true })
      document.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true })
      document.addEventListener('pointerdown', handleFirstInteraction, { capture: true, once: true })
      document.addEventListener('keydown', handleFirstInteraction, { capture: true, once: true })
    })
})

onUnmounted(() => {
  removeInteractionListeners()
})
</script>

<template>
  <div v-if="config.musica_activa !== false" class="inline-flex items-center">
    <audio ref="audioRef" :src="effectiveMusicUrl" loop preload="auto" @ended="isPlaying = false"></audio>

    <button type="button" @click="toggleMusic"
      class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer shadow-2xs min-h-[36px]"
      :class="[
        isPlaying
          ? darkMode
            ? 'bg-amber-500/25 text-amber-300 border-amber-400/50 ring-1 ring-amber-400/20'
            : 'bg-amber-100 text-amber-950 border-amber-300 ring-1 ring-amber-400/30 shadow-xs'
          : darkMode
            ? 'bg-white/10 text-slate-300 border-white/20 hover:bg-white/20'
            : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
      ]" :title="isPlaying ? 'Pausar música ambiental' : 'Reproducir música ambiental'"
      aria-label="Control de música ambiental">
      <span class="relative flex h-3.5 w-3.5 items-center justify-center">
        <span v-if="isPlaying" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
        <SpeakerWaveIcon v-if="isPlaying" :class="['w-3.5 h-3.5 relative z-10', darkMode ? 'text-amber-300' : 'text-amber-700']" />
        <MusicalNoteIcon v-else :class="['w-3.5 h-3.5', darkMode ? 'text-slate-300' : 'text-slate-600']" />
      </span>

      <span class="text-xs font-bold hidden min-[360px]:inline">
        {{ isPlaying ? 'Música' : 'Música' }}
      </span>
    </button>
  </div>
</template>
