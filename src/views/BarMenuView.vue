<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/composables/useMenuStore'
import { useVisitorTracker } from '@/composables/useVisitorTracker'
import { usePageMeta } from '@/composables/usePageMeta'
import HeaderMenu from '@/components/HeaderMenu.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductImageModal from '@/components/ProductImageModal.vue'
import WhatsAppSubscribeCard from '@/components/WhatsAppSubscribeCard.vue'
import type { Producto } from '@/types/database'
import {
  InboxIcon,
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const router  = useRouter()
const route   = useRoute()
const { categories, products, config } = useMenuStore()
const { trackVisit } = useVisitorTracker()

// ─── MÚSICA AMBIENTAL ────────────────────────────────────────────────────────
const BAR_MUSIC_URL = computed(() =>
  config.value.bar_music_url ||
  config.value.musica_url ||
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
)

const isMusicPlaying = ref(false)
let audio: HTMLAudioElement | null = null

function setupAudio() {
  if (audio) return
  audio = new Audio(BAR_MUSIC_URL.value)
  audio.loop  = true
  audio.volume = (config.value.musica_volumen ?? 35) / 100
}

async function toggleMusic() {
  setupAudio()
  if (!audio) return

  if (isMusicPlaying.value) {
    audio.pause()
    isMusicPlaying.value = false
  } else {
    try {
      await audio.play()
      isMusicPlaying.value = true
    } catch (e) {
      // Navegador bloqueó autoplay — el usuario ya interactuó, reintentar
      try {
        await audio.play()
        isMusicPlaying.value = true
      } catch (_) {
        console.warn('[Bar] Audio play blocked:', e)
      }
    }
  }
}

// Intentar autoplay tras primera interacción del usuario
function handleFirstInteraction() {
  if (!isMusicPlaying.value && audio === null) {
    setupAudio()
    const a = audio as HTMLAudioElement | null
    a?.play().then(() => {
      isMusicPlaying.value = true
    }).catch(() => { /* bloqueado hasta interacción explícita */ })
  }
  document.removeEventListener('click', handleFirstInteraction, { capture: true })
  document.removeEventListener('touchstart', handleFirstInteraction, { capture: true })
}

// ─── VIDEO YOUTUBE ────────────────────────────────────────────────────────────
const BAR_VIDEO_SRC = computed(() => {
  const url = config.value.bar_video_url || ''
  if (!url) return null

  // Detectar YouTube y convertir a embed
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&modestbranding=1&rel=0`
  }

  // URL local o externa directa (video .mp4 etc.)
  return url
})

const isYouTubeVideo = computed(() => {
  const url = config.value.bar_video_url || ''
  return url.includes('youtube') || url.includes('youtu.be')
})

// ─── MENÚ Y PRODUCTOS ─────────────────────────────────────────────────────────
onMounted(() => {
  trackVisit('bar', route.query)

  usePageMeta({
    title: 'Bar & Coctelería | Las Delicias Restobar',
    description: '\uD83C\uDF79 Descubre nuestra carta de tragos, cocteles y bebidas artesanales. Ambiente, música y los mejores sabores de Las Delicias Restobar.',
    url: 'https://lasdelicias.onrender.com/bar'
  })

  // Registrar primera interacción para autoplay de música
  document.addEventListener('click', handleFirstInteraction, { capture: true, once: true })
  document.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true })
})

onUnmounted(() => {
  audio?.pause()
  audio = null
  document.removeEventListener('click', handleFirstInteraction, { capture: true })
  document.removeEventListener('touchstart', handleFirstInteraction, { capture: true })
})

const searchQuery = ref('')
const selectedProductForImage = ref<Producto | null>(null)
const isImageModalOpen = ref(false)

const currentTime = ref(
  new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
)

// Bar category
const barCategory = computed(() => {
  return categories.value.find(c =>
    c.siempre_disponible ||
    c.nombre.toLowerCase().includes('bar') ||
    c.nombre.toLowerCase().includes('coctel')
  ) || categories.value[categories.value.length - 1]
})

// Bar products with search
const barProducts = computed(() => {
  const barCatId = barCategory.value?.id
  let list = products.value.filter(p => p.categoria_id === barCatId)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q))
    )
  }

  return list
})

function openProductImage(product: Producto) {
  selectedProductForImage.value = product
  isImageModalOpen.value = true
}

function closeProductImage() {
  isImageModalOpen.value = false
}

function goToKitchenMenu() {
  audio?.pause()
  router.push('/')
}
</script>

<template>
  <!-- Fondo oscuro themed para el Bar — identidad visual nocturna/premium -->
  <div class="min-h-screen bg-[#0d0d1a] flex flex-col justify-between" style="background: linear-gradient(160deg, #0d0d1a 0%, #0f1424 50%, #0a0d18 100%)">

    <!-- Header adaptado al tema oscuro -->
    <HeaderMenu
      :current-time="currentTime"
      current-shift-name="Bar & Coctelería"
      :is-realtime-connected="true"
      :is-supabase-configured="false"
      v-model:search-query="searchQuery"
    />

    <!-- Main Content -->
    <main class="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 pb-24 pt-2">

      <!-- ── HERO BAR HEADER ────────────────────────────────────────────────── -->
      <div class="mt-2 mb-4 relative overflow-hidden rounded-3xl border border-amber-500/20 shadow-2xl"
           style="background: linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0030 100%)">
        <!-- Glows decorativos -->
        <div class="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-8 -left-8 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div class="relative z-10 px-5 py-5 sm:px-6 sm:py-6">
          <!-- Badge + control de música -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                🍻 Bar & Coctelería
              </span>
              <span class="text-[10px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-full">
                Servicio Continuo 24/7
              </span>
            </div>

            <!-- Botón música -->
            <button
              type="button"
              @click="toggleMusic"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              :class="isMusicPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-white/8 text-slate-400 border border-white/15 hover:bg-white/15'"
            >
              <SpeakerWaveIcon v-if="isMusicPlaying" class="w-4 h-4" />
              <SpeakerXMarkIcon v-else class="w-4 h-4" />
              <span>{{ isMusicPlaying ? 'Música ON' : 'Música' }}</span>
            </button>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1" style="text-shadow: 0 0 40px rgba(251,191,36,0.3)">
            Carta del Bar
          </h1>
          <p class="text-sm text-slate-400 leading-relaxed">
            Cocteles de autor, clásicos internacionales, cervezas y bebidas sin alcohol.
          </p>

          <!-- Video promocional si está configurado -->
          <div v-if="BAR_VIDEO_SRC" class="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg aspect-video">
            <!-- YouTube embed -->
            <iframe
              v-if="isYouTubeVideo"
              :src="BAR_VIDEO_SRC"
              class="w-full h-full"
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowfullscreen
            ></iframe>
            <!-- Video local/externo -->
            <video
              v-else
              :src="BAR_VIDEO_SRC"
              autoplay
              muted
              loop
              playsinline
              class="w-full h-full object-cover"
            ></video>
          </div>

          <!-- Si no hay video, mostrar separador decorativo con emojis temáticos -->
          <div v-else class="mt-4 flex items-center gap-2 text-2xl">
            <span class="opacity-80">🍸</span>
            <div class="flex-1 h-px bg-gradient-to-r from-amber-500/40 via-purple-500/30 to-transparent"></div>
            <span class="opacity-80">🍹</span>
            <div class="flex-1 h-px bg-gradient-to-l from-amber-500/40 via-purple-500/30 to-transparent"></div>
            <span class="opacity-80">🎵</span>
          </div>
        </div>
      </div>

      <!-- ── BUSCADOR TEMÁTICO ───────────────────────────────────────────────── -->
      <div class="mb-4 relative">
        <MagnifyingGlassIcon class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar bebida, coctel..."
          class="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/6 border border-white/12 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500/40 focus:bg-white/10 transition-all"
        />
      </div>

      <!-- ── HEADER CATEGORÍA + CONTADOR ───────────────────────────────────── -->
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span v-if="searchQuery">Resultados en Bar</span>
            <span v-else>{{ barCategory?.nombre || 'Bar & Coctelería' }}</span>
          </h2>
          <p class="text-[11px] text-slate-500 mt-0.5">
            <span v-if="searchQuery">
              {{ barProducts.length }} {{ barProducts.length === 1 ? 'bebida encontrada' : 'bebidas encontradas' }} para "{{ searchQuery }}"
            </span>
            <span v-else>Selecciona tu bebida favorita</span>
          </p>
        </div>

        <span class="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-xl">
          {{ barProducts.length }} {{ barProducts.length === 1 ? 'ítem' : 'ítems' }}
        </span>
      </div>

      <!-- ── EMPTY STATE ────────────────────────────────────────────────────── -->
      <div
        v-if="barProducts.length === 0"
        class="text-center py-12 px-4 rounded-2xl border border-white/10 my-4"
        style="background: rgba(255,255,255,0.04)"
      >
        <InboxIcon class="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 class="text-sm font-bold text-slate-300 mb-1">No hay bebidas encontradas</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-3">
          No encontramos opciones que coincidan con "{{ searchQuery }}".
        </p>
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="btn btn-xs border border-white/20 text-slate-300 hover:bg-white/10 rounded-xl cursor-pointer"
        >
          Limpiar búsqueda
        </button>
      </div>

      <!-- ── PRODUCTOS DEL BAR ────────────────────────────────────────────── -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ProductCard
          v-for="prod in barProducts"
          :key="prod.id"
          :product="prod"
          @open-image="openProductImage"
        />
      </div>

      <!-- ── WHATSAPP CARD ──────────────────────────────────────────────────── -->
      <WhatsAppSubscribeCard source-menu="bar" />

      <!-- ── LINK DE REGRESO A COCINA ─────────────────────────────────────── -->
      <div class="text-center py-5">
        <button
          type="button"
          @click="goToKitchenMenu"
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer bg-white/6 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/12"
        >
          <BuildingStorefrontIcon class="w-4 h-4" />
          <span>Volver a la Carta de Cocina</span>
          <ArrowLeftIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </main>

    <!-- Footer del Bar -->
    <footer class="border-t border-white/8 py-4 px-4 text-center text-xs text-slate-600">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="font-semibold text-slate-500">Las Delicias Restobar © {{ new Date().getFullYear() }} · Bar & Coctelería</p>
        <p class="text-[11px] text-slate-700">🍸 Buen trago, buena música, buenas personas.</p>
      </div>
    </footer>

    <!-- Modal de imagen -->
    <ProductImageModal
      :is-open="isImageModalOpen"
      :product="selectedProductForImage"
      @close="closeProductImage"
    />
  </div>
</template>

<style scoped>
/* Override para que el buscador nativo del browser se vea bien en dark */
input[type="search"]::-webkit-search-cancel-button {
  filter: invert(1) opacity(0.4);
}
</style>
