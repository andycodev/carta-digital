<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/composables/useMenuStore'
import { useVisitorTracker } from '@/composables/useVisitorTracker'
import { usePageMeta } from '@/composables/usePageMeta'
import HeaderMenu from '@/components/HeaderMenu.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductImageModal from '@/components/ProductImageModal.vue'
import type { Producto } from '@/types/database'
import {
  InboxIcon,
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  SparklesIcon
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
      console.warn('[Bar] Audio play blocked:', e)
    }
  }
}

// Intentar autoplay al montar
function attemptAutoplay() {
  if (config.value.musica_activa && !isMusicPlaying.value) {
    setupAudio()
    const a = audio as HTMLAudioElement | null
    a?.play().then(() => {
      isMusicPlaying.value = true
    }).catch(() => {
      // Bloqueado por navegador - se activará en primera interacción
      console.log('[Bar] Autoplay blocked, will activate on interaction')
    })
  }
}

// Activar en primera interacción si autoplay falló
function handleFirstInteraction() {
  if (config.value.musica_activa && !isMusicPlaying.value) {
    setupAudio()
    const a = audio as HTMLAudioElement | null
    a?.play().then(() => {
      isMusicPlaying.value = true
    }).catch(() => {})
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

  // Intentar autoplay de música
  attemptAutoplay()

  // Registrar primera interacción como fallback
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

// Categorías personalizadas del Bar - simplificadas para tabs
const barCategories = computed(() => [
  { id: 'todos', nombre: 'Todos', icon: '🍸' },
  { id: 'cocteles', nombre: 'Cocteles', icon: '🍹' },
  { id: 'cervezas', nombre: 'Cervezas', icon: '🍺' },
  { id: 'sin-alcohol', nombre: 'Sin Alcohol', icon: '🧃' }
])

const selectedBarCategory = ref('todos')

// Filtrar productos por categoría personalizada del Bar
const filteredBarProducts = computed(() => {
  let list = products.value.filter(p => p.categoria_id === barCategory.value?.id)

  // Filtrar por categoría personalizada del Bar (basado en nombre)
  if (selectedBarCategory.value === 'cocteles') {
    list = list.filter(p => 
      p.nombre.toLowerCase().includes('coctel') ||
      p.nombre.toLowerCase().includes('pisco') ||
      p.nombre.toLowerCase().includes('martini') ||
      p.nombre.toLowerCase().includes('gin') ||
      p.descripcion?.toLowerCase().includes('coctel')
    )
  } else if (selectedBarCategory.value === 'cervezas') {
    list = list.filter(p => 
      p.nombre.toLowerCase().includes('cerveza') ||
      p.nombre.toLowerCase().includes('beer')
    )
  } else if (selectedBarCategory.value === 'sin-alcohol') {
    list = list.filter(p => 
      p.nombre.toLowerCase().includes('sin alcohol') ||
      p.nombre.toLowerCase().includes('mocktail') ||
      p.nombre.toLowerCase().includes('jugo') ||
      p.nombre.toLowerCase().includes('refresco')
    )
  }
  // 'todos' no filtra por subcategoría

  // Aplicar búsqueda
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q))
    )
  }

  return list
})

function selectBarCategory(catId: string) {
  selectedBarCategory.value = catId
  searchQuery.value = ''
}

// Bar category
const barCategory = computed(() => {
  return categories.value.find(c =>
    c.siempre_disponible ||
    c.nombre.toLowerCase().includes('bar') ||
    c.nombre.toLowerCase().includes('coctel')
  ) || categories.value[categories.value.length - 1]
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
  <!-- Fondo oscuro del Bar - compacto como MenuView -->
  <div class="min-h-screen bg-[#0d0d1a] flex flex-col justify-between" style="background: linear-gradient(160deg, #0d0d1a 0%, #0f1424 50%, #0a0d18 100%)">
    <!-- Header compartido con estilo Bar -->
    <HeaderMenu
      :current-time="currentTime"
      current-shift-name="Bar & Coctelería"
      :is-realtime-connected="true"
      :is-supabase-configured="false"
      v-model:search-query="searchQuery"
    >
      <!-- Botón de música en el header -->
      <template #extra-actions>
        <button
          type="button"
          @click="toggleMusic"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="isMusicPlaying
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'bg-white/8 text-slate-400 border border-white/15'"
        >
          <SpeakerWaveIcon v-if="isMusicPlaying" class="w-4 h-4" />
          <SpeakerXMarkIcon v-else class="w-4 h-4" />
          <span>{{ isMusicPlaying ? 'ON' : 'OFF' }}</span>
        </button>
      </template>
    </HeaderMenu>

    <!-- Main Content compacto -->
    <main class="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 pb-20 pt-1">

      <!-- Hero del Bar sin video -->
      <div class="mb-4 p-4 rounded-2xl border-2 border-amber-500/40 shadow-lg" style="background: linear-gradient(135deg, #2d1b00 0%, #1a0a2e 50%, #0f0f1a 100%)">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
            🍸
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <SparklesIcon class="w-5 h-5 text-amber-400" />
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/20 px-2 py-1 rounded-full">
                Bar & Coctelería
              </span>
            </div>
            <h2 class="text-2xl font-black text-white mb-1" style="text-shadow: 0 0 30px rgba(251,191,36,0.4)">
              Mixología de Autor
            </h2>
            <p class="text-sm text-slate-300">
              Cocteles artesanales, destilados premium y ambiente exclusivo
            </p>
          </div>
        </div>
      </div>


      <!-- Header de sección compacto -->
      <div class="my-2.5 flex items-center justify-between border-b border-white/10 pb-2">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span v-if="searchQuery">Resultados</span>
            <span v-else>Carta del Bar</span>
          </h2>
          <p class="text-[11px] text-slate-400 mt-0.5">
            <span v-if="searchQuery">
              {{ filteredBarProducts.length }} {{ filteredBarProducts.length === 1 ? 'resultado' : 'resultados' }} para "{{ searchQuery }}"
            </span>
            <span v-else>Servicio continuo 24/7</span>
          </p>
        </div>
        <span class="badge bg-white/10 border border-white/20 text-slate-300 font-semibold text-[11px] px-2 py-1.5">
          {{ filteredBarProducts.length }} {{ filteredBarProducts.length === 1 ? 'ítem' : 'ítems' }}
        </span>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredBarProducts.length === 0"
        class="text-center py-10 px-4 bg-white/5 border border-white/10 rounded-xl"
      >
        <InboxIcon class="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h3 class="text-sm font-bold text-slate-300 mb-1">No hay bebidas</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-3">
          <span v-if="searchQuery">
            No encontramos opciones para "{{ searchQuery }}".
          </span>
          <span v-else>
            Esta categoría está vacía.
          </span>
        </p>
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''"
          class="btn btn-xs btn-outline border-white/20 text-slate-300 hover:bg-white/10 rounded-lg"
        >
          Limpiar búsqueda
        </button>
      </div>

      <!-- Product Cards - usando ProductCard compartido -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ProductCard
          v-for="prod in filteredBarProducts"
          :key="prod.id"
          :product="prod"
          @open-image="openProductImage"
        />
      </div>


      <!-- Link de regreso a cocina -->
      <div class="mt-4 text-center">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors bg-white/6 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/12"
        >
          <BuildingStorefrontIcon class="w-4 h-4" />
          <span>Volver a la Carta Principal</span>
          <ArrowLeftIcon class="w-3.5 h-3.5" />
        </router-link>
      </div>
    </main>

    <!-- Footer minimalista -->
    <footer class="border-t border-white/10 py-4 px-4 text-center text-xs text-slate-500">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="font-semibold text-slate-400">
          Las Delicias Restobar © {{ new Date().getFullYear() }} · Bar & Coctelería
        </p>
        <p class="text-[11px] text-slate-600">🍸 Buen trago, buena música, buenas personas.</p>
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
