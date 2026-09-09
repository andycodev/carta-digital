<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

// ── Imágenes del slider (temática bar & coctelería) ───────────────────────────
const slides = [
  {
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cócteles de colores vibrantes',
    caption: 'Mixología de Autor'
  },
  {
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=80',
    alt: 'Bar premium con cristalería fina',
    caption: 'Experiencia Premium'
  },
  {
    url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Barman preparando un cóctel',
    caption: 'Arte detrás de la barra'
  },
  {
    url: 'https://images.unsplash.com/photo-1605989658424-bf0b9c08beaf?auto=format&fit=crop&w=1200&q=80',
    alt: 'Whisky on the rocks',
    caption: 'Destilados Selectos'
  },
  {
    url: 'https://images.unsplash.com/photo-1470338745628-171cf53de3a8?auto=format&fit=crop&w=1200&q=80',
    alt: 'Ambiente bar nocturno',
    caption: 'Ambiente Exclusivo'
  }
]

const AUTOPLAY_INTERVAL = 4000  // ms entre transiciones automáticas
const RESUME_DELAY = 5000       // ms de inactividad para reanudar autoplay

const currentIndex = ref(0)
const isTransitioning = ref(false)
let autoplayTimer: number | null = null
let resumeTimer: number | null = null

// ── Navegación ────────────────────────────────────────────────────────────────

function goTo(index: number) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = (index + slides.length) % slides.length
  setTimeout(() => { isTransitioning.value = false }, 500)
}

function next() {
  goTo(currentIndex.value + 1)
}

function prev() {
  goTo(currentIndex.value - 1)
}

// ── Autoplay ──────────────────────────────────────────────────────────────────

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = window.setInterval(next, AUTOPLAY_INTERVAL)
}

function stopAutoplay() {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function stopAutoplayTemporarily() {
  stopAutoplay()
  if (resumeTimer !== null) clearTimeout(resumeTimer)
  resumeTimer = window.setTimeout(startAutoplay, RESUME_DELAY)
}

// ── Interacción manual ────────────────────────────────────────────────────────

function handlePrev() {
  prev()
  stopAutoplayTemporarily()
}

function handleNext() {
  next()
  stopAutoplayTemporarily()
}

function handleDotClick(index: number) {
  goTo(index)
  stopAutoplayTemporarily()
}

// ── Soporte touch/swipe ───────────────────────────────────────────────────────
let touchStartX = 0
let touchEndX = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX
}

function onTouchEnd(e: TouchEvent) {
  touchEndX = e.changedTouches[0].screenX
  const delta = touchStartX - touchEndX
  if (Math.abs(delta) > 50) {
    if (delta > 0) handleNext()
    else handlePrev()
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
  if (resumeTimer !== null) clearTimeout(resumeTimer)
})
</script>

<template>
  <!-- Slider container -->
  <div
    class="relative w-full overflow-hidden select-none"
    style="height: 200px;"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
    aria-label="Galería de imágenes del bar"
    role="region"
  >
    <!-- Slides wrapper -->
    <div
      class="flex h-full transition-transform duration-500 ease-in-out will-change-transform"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(slide, i) in slides"
        :key="i"
        class="relative shrink-0 w-full h-full"
        :aria-hidden="i !== currentIndex"
      >
        <!-- Imagen -->
        <img
          :src="slide.url"
          :alt="slide.alt"
          class="w-full h-full object-cover"
          :loading="i === 0 ? 'eager' : 'lazy'"
          draggable="false"
        />

        <!-- Overlay degradado + caption -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
        <div class="absolute bottom-3 left-4 right-16">
          <span class="text-white text-xs font-semibold tracking-wide drop-shadow-md">
            {{ slide.caption }}
          </span>
        </div>
      </div>
    </div>

    <!-- Botón anterior -->
    <button
      type="button"
      @click="handlePrev"
      class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 text-white transition-all duration-200 hover:scale-110 active:scale-95 border border-white/20 cursor-pointer"
      aria-label="Imagen anterior"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </button>

    <!-- Botón siguiente -->
    <button
      type="button"
      @click="handleNext"
      class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 text-white transition-all duration-200 hover:scale-110 active:scale-95 border border-white/20 cursor-pointer"
      aria-label="Imagen siguiente"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </button>

    <!-- Indicadores de puntos -->
    <div class="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
      <button
        v-for="(_, i) in slides"
        :key="i"
        type="button"
        @click="handleDotClick(i)"
        class="rounded-full transition-all duration-300 cursor-pointer"
        :class="i === currentIndex
          ? 'bg-white w-4 h-1.5'
          : 'bg-white/40 hover:bg-white/70 w-1.5 h-1.5'"
        :aria-label="`Ir a imagen ${i + 1}`"
        :aria-current="i === currentIndex ? 'true' : undefined"
      />
    </div>

    <!-- Contador de slide (esquina superior derecha) -->
    <div class="absolute top-2.5 right-3 z-10 bg-black/40 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 tabular-nums">
      {{ currentIndex + 1 }} / {{ slides.length }}
    </div>
  </div>
</template>
