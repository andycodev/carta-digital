<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import { MusicalNoteIcon, SpeakerWaveIcon } from '@heroicons/vue/24/outline'

const { config } = useMenuStore()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const hasError = ref(false)

const STORAGE_KEY_MUSIC_PREF = 'delicias_user_wants_music'

function toggleMusic() {
  if (!audioRef.value || !config.value.musica_url) return

  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
    sessionStorage.setItem(STORAGE_KEY_MUSIC_PREF, 'false')
  } else {
    audioRef.value.volume = (config.value.musica_volumen || 35) / 100
    audioRef.value
      .play()
      .then(() => {
        isPlaying.value = true
        hasError.value = false
        sessionStorage.setItem(STORAGE_KEY_MUSIC_PREF, 'true')
      })
      .catch(err => {
        console.warn('Audio playback blocked or failed:', err)
        hasError.value = true
        isPlaying.value = false
      })
  }
}

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

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = (config.value.musica_volumen || 35) / 100
  }
  const pref = sessionStorage.getItem(STORAGE_KEY_MUSIC_PREF)
  if (pref === 'true' && config.value.musica_activa) {
    toggleMusic()
  }
})
</script>

<template>
  <div v-if="config.musica_activa" class="inline-flex items-center">
    <audio
      ref="audioRef"
      :src="config.musica_url"
      loop
      preload="none"
      @ended="isPlaying = false"
    ></audio>

    <button
      type="button"
      @click="toggleMusic"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border cursor-pointer"
      :class="[
        isPlaying
          ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
      ]"
      :title="isPlaying ? 'Pausar música ambiental' : 'Reproducir música ambiental'"
      aria-label="Control de música ambiental"
    >
      <SpeakerWaveIcon v-if="isPlaying" class="w-3.5 h-3.5 text-amber-700 animate-pulse" />
      <MusicalNoteIcon v-else class="w-3.5 h-3.5 text-slate-500" />

      <span class="text-[11px] font-medium hidden sm:inline">
        {{ isPlaying ? 'Música activa' : 'Música' }}
      </span>
    </button>
  </div>
</template>

