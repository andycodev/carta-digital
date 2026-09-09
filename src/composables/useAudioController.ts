/**
 * useAudioController
 * ------------------
 * Bus de coordinación de audio global (Singleton reactivo).
 * Permite que el video del BarModal y el AmbientMusicPlayer
 * no se superpongan en sonido.
 *
 * Uso:
 *   - BarModal activa videoAudioActive = true cuando el usuario quita el mute del video.
 *   - AmbientMusicPlayer escucha videoAudioActive y pausa/reanuda su música.
 */

import { ref } from 'vue'

// ── Estado global singleton ────────────────────────────────────────────────────

/** true cuando el audio del video del BarModal está activo (sin mute) */
const videoAudioActive = ref(false)

// ── Composable ────────────────────────────────────────────────────────────────

export function useAudioController() {
  /**
   * Llamar cuando el video activa audio (usuario quitó mute).
   * La música ambiental debe pausarse.
   */
  function activateVideoAudio() {
    videoAudioActive.value = true
  }

  /**
   * Llamar cuando el video vuelve a silenciarse o se cierra el modal.
   * La música ambiental debe reanudarse si estaba activa.
   */
  function deactivateVideoAudio() {
    videoAudioActive.value = false
  }

  return {
    videoAudioActive,
    activateVideoAudio,
    deactivateVideoAudio,
  }
}
