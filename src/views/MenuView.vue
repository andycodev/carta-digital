<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/composables/useMenuStore'
import { useMenuSchedule } from '@/composables/useMenuSchedule'
import { useVisitorTracker } from '@/composables/useVisitorTracker'
import HeaderMenu from '@/components/HeaderMenu.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductImageModal from '@/components/ProductImageModal.vue'
import BarModal from '@/components/BarModal.vue'
import WhatsAppSubscribeCard from '@/components/WhatsAppSubscribeCard.vue'
import type { Producto } from '@/types/database'
import {
  InboxIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

const {
  categories,
  products
} = useMenuStore()

const route = useRoute()
const { trackVisit } = useVisitorTracker()

const isRealtimeConnected = ref(true)
const isSupabaseConfigured = ref(false)
const isLoading = ref(false)
const lastRealtimeEvent = ref<string | null>(null)

onMounted(() => {
  trackVisit('main', route.query)
})

const {
  currentTime,
  selectedCategoryId,
  visibleCategories,
  currentShiftCategory,
  autoSelectCategory
} = useMenuSchedule(categories)

const searchQuery = ref('')
const barModalRef = ref<InstanceType<typeof BarModal> | null>(null)

// Image Modal State
const selectedProductForImage = ref<Producto | null>(null)
const isImageModalOpen = ref(false)

function openProductImage(product: Producto) {
  selectedProductForImage.value = product
  isImageModalOpen.value = true
}

function closeProductImage() {
  isImageModalOpen.value = false
}

// Watch categories updates to ensure selected category is valid
watch(visibleCategories, () => {
  autoSelectCategory()
}, { deep: true })

// Active category metadata
const activeCategory = computed(() => {
  return categories.value.find(c => c.id === selectedCategoryId.value) || null
})

const isAlmuerzoCategory = computed(() => {
  return !!activeCategory.value?.nombre.toLowerCase().includes('almuerzo')
})

// Find ID of Bar category for modal quick jump
const barCategory = computed(() => {
  return categories.value.find(c => c.siempre_disponible) || null
})

// Filter products based on selected category AND search term
const filteredProducts = computed(() => {
  let list = products.value

  // If search query is present, search across all products or within current category
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    return list.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(q))
    )
  }

  // Filter by selected category
  if (selectedCategoryId.value) {
    list = list.filter(p => p.categoria_id === selectedCategoryId.value)
  }

  return list
})

function handleCategorySelect(id: string) {
  selectedCategoryId.value = id
  searchQuery.value = '' // Clear search on tab switch for clarity
}

function handleNavigateToBar(barId: string) {
  selectedCategoryId.value = barId
  searchQuery.value = ''
}

function triggerOpenBarModal() {
  barModalRef.value?.openModal()
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] flex flex-col justify-between selection:bg-brand-primary selection:text-white">
    <!-- Main Header -->
    <HeaderMenu
      :current-time="currentTime"
      :current-shift-name="currentShiftCategory?.nombre"
      :is-realtime-connected="isRealtimeConnected"
      :is-supabase-configured="isSupabaseConfigured"
      v-model:search-query="searchQuery"
      @open-bar-modal="triggerOpenBarModal"
    />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 pb-20 pt-1">
      <!-- Realtime notification toast if active -->
      <transition name="fade">
        <div
          v-if="lastRealtimeEvent"
          class="my-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs"
        >
          <div class="flex items-center gap-1.5 truncate">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping shrink-0"></span>
            <span class="truncate"><strong>En vivo:</strong> {{ lastRealtimeEvent }}</span>
          </div>
          <span class="text-[10px] text-amber-700 font-semibold uppercase shrink-0">Sync</span>
        </div>
      </transition>

      <!-- Category Filter Tabs -->
      <CategoryTabs
        v-if="!searchQuery"
        :categories="visibleCategories"
        :selected-id="selectedCategoryId"
        :current-shift-id="currentShiftCategory?.id || null"
        @select="handleCategorySelect"
      />

      <!-- Search results title / Category header -->
      <div class="my-2.5 flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span v-if="searchQuery">Resultados de búsqueda</span>
            <span v-else>{{ activeCategory?.nombre || 'Nuestra Carta' }}</span>
          </h2>
          <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            <span v-if="searchQuery">
              {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'resultado' : 'resultados' }} para "{{ searchQuery }}"
            </span>
            <span v-else-if="activeCategory?.siempre_disponible">
              Disponible todo el día • Servicio continuo
            </span>
            <span v-else-if="activeCategory">
              Horario: {{ activeCategory.hora_inicio.substring(0, 5) }} a {{ activeCategory.hora_fin.substring(0, 5) }}
            </span>
          </p>
        </div>

        <span class="badge bg-white border border-slate-200 text-slate-600 font-semibold text-[11px] px-2 py-1.5 shadow-2xs">
          {{ filteredProducts.length }} {{ filteredProducts.length === 1 ? 'ítem' : 'ítems' }}
        </span>
      </div>

      <!-- Promoción Destacada Almuerzo (Exclusiva de la carta de Almuerzo) -->
      <div
        v-if="isAlmuerzoCategory && !searchQuery"
        class="my-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-700 to-amber-700 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-orange-500/40 relative overflow-hidden"
      >
        <div class="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="flex items-center gap-3 relative z-10">
          <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shrink-0 border border-white/25 shadow-xs">
            <SparklesIcon class="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white">
                Promoción Especial
              </span>
              <span class="text-xs text-orange-100 font-medium italic">
                “Buen sabor, buen precio.”
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
              MENÚ DESDE S/ 10
            </h3>
          </div>
        </div>

        <div class="shrink-0 self-end sm:self-auto relative z-10">
          <span class="text-[11px] font-semibold text-orange-100 bg-black/25 px-3 py-1 rounded-xl border border-white/15">
            Exclusivo en Almuerzo
          </span>
        </div>
      </div>

      <!-- PRINTABLE WRAPPER FOR html2pdf.js -->
      <div id="menu-printable-container" class="w-full">
        <!-- PDF Exclusive Header for clean printouts -->
        <div class="hidden print:block p-4 border-b-2 border-slate-900 mb-6 text-center">
          <h1 class="text-2xl font-bold text-slate-900 uppercase tracking-wider">
            LAS DELICIAS RESTOBAR
          </h1>
          <p class="text-sm text-slate-600">Carta Gastronómica & Coctelería</p>
        </div>

        <!-- Skeleton Loading State -->
        <div
          v-if="isLoading"
          class="space-y-2"
        >
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white border border-slate-200 p-2.5 rounded-xl animate-pulse flex items-center justify-between gap-3"
          >
            <div class="flex-1 space-y-1.5">
              <div class="h-3.5 bg-slate-200 rounded w-3/4"></div>
              <div class="h-3.5 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div class="w-14 h-14 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredProducts.length === 0"
          class="text-center py-10 px-4 bg-white border border-slate-200 rounded-xl shadow-2xs"
        >
          <InboxIcon class="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 class="text-sm sm:text-base font-bold text-slate-900 mb-1">
            No hay opciones disponibles
          </h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mb-3">
            <span v-if="searchQuery">
              No encontramos platos o bebidas que coincidan con "{{ searchQuery }}".
            </span>
            <span v-else>
              Los platos de esta categoría no están disponibles en este turno.
            </span>
          </p>
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="btn btn-xs btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-lg"
          >
            Limpiar búsqueda
          </button>
        </div>


        <!-- Products List Format (Mobile single column list, 2-column list on desktop) -->
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          <ProductCard
            v-for="prod in filteredProducts"
            :key="prod.id"
            :product="prod"
            @open-image="openProductImage"
          />
        </div>
      </div>

      <!-- Independent Bar Menu Access Banner -->
      <router-link
        to="/bar"
        class="my-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xs flex items-center justify-between gap-3 border border-slate-700/60 hover:border-brand-primary transition-all group cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
            <SparklesIcon class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-500/20">
                Carta Independiente
              </span>
              <span class="text-xs text-slate-300 font-medium">Servicio Continuo 24/7</span>
            </div>
            <h4 class="text-sm font-bold text-white mt-0.5">
              Carta de Bar & Coctelería de Autor
            </h4>
          </div>
        </div>
        <div class="flex items-center gap-1 text-xs font-semibold text-orange-400 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 group-hover:bg-brand-primary group-hover:text-white transition-all shrink-0">
          <span>Ver Bar</span>
          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
        </div>
      </router-link>

      <!-- WhatsApp Community Subscription Card -->
      <WhatsAppSubscribeCard source-menu="main" />
    </main>

    <!-- Interactive Image Modal (Lightbox) -->
    <ProductImageModal
      :product="selectedProductForImage"
      :is-open="isImageModalOpen"
      @close="closeProductImage"
    />

    <!-- Bar Modal Component & Floating Trigger -->
    <BarModal
      ref="barModalRef"
      :bar-category-id="barCategory?.id"
      @navigate-to-bar="handleNavigateToBar"
    />

    <!-- Minimalist Clean Footer -->
    <footer class="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
      <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="font-semibold text-slate-700">
          Las Delicias Restobar © {{ new Date().getFullYear() }} • Carta Digital
        </p>
        <p class="text-[11px] text-slate-400">
          Actualización instantánea en tiempo real
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

