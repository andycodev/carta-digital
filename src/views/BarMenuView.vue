<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/composables/useMenuStore'
import { useVisitorTracker } from '@/composables/useVisitorTracker'
import HeaderMenu from '@/components/HeaderMenu.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductImageModal from '@/components/ProductImageModal.vue'
import WhatsAppSubscribeCard from '@/components/WhatsAppSubscribeCard.vue'
import type { Producto } from '@/types/database'
import {
  SparklesIcon,
  InboxIcon,
  ArrowLeftIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const { categories, products } = useMenuStore()
const { trackVisit } = useVisitorTracker()

onMounted(() => {
  trackVisit('bar', route.query)
})

const searchQuery = ref('')
const selectedProductForImage = ref<Producto | null>(null)
const isImageModalOpen = ref(false)

const currentTime = ref(
  new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
)

// Find Bar category
const barCategory = computed(() => {
  return categories.value.find(c =>
    c.siempre_disponible ||
    c.nombre.toLowerCase().includes('bar') ||
    c.nombre.toLowerCase().includes('coctel')
  ) || categories.value[categories.value.length - 1]
})

// Bar products
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
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] flex flex-col justify-between selection:bg-brand-primary selection:text-white">
    <!-- Main Header -->
    <HeaderMenu
      :current-time="currentTime"
      current-shift-name="Bar & Coctelería"
      :is-realtime-connected="true"
      :is-supabase-configured="false"
      v-model:search-query="searchQuery"
    />

    <!-- Main Content Container -->
    <main class="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 pb-20 pt-2">
      <!-- Switcher to Kitchen Menu / Notice -->
      <div class="mb-3 p-3 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <SparklesIcon class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded-md border border-orange-500/20">
                Carta Independiente
              </span>
              <span class="text-xs text-slate-300">Servicio Continuo 24/7</span>
            </div>
            <h2 class="text-base sm:text-lg font-extrabold text-white mt-0.5 tracking-tight">
              Bar, Coctelería & Bebidas
            </h2>
          </div>
        </div>

        <button
          type="button"
          @click="goToKitchenMenu"
          class="btn btn-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer self-stretch sm:self-auto"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5 text-brand-primary" />
          <span>Ver Carta de Cocina / Menú</span>
        </button>
      </div>

      <!-- Category info bar with search and count -->
      <div class="my-2.5 flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div>
          <h1 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span v-if="searchQuery">Resultados en Bar</span>
            <span v-else>{{ barCategory?.nombre || 'Bar & Coctelería' }}</span>
          </h1>
          <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            <span v-if="searchQuery">
              {{ barProducts.length }} {{ barProducts.length === 1 ? 'bebida encontrada' : 'bebidas encontradas' }} para "{{ searchQuery }}"
            </span>
            <span v-else>
              Cocteles de autor, clásicos, cervezas y bebidas sin alcohol
            </span>
          </p>
        </div>

        <span class="badge bg-white border border-slate-200 text-slate-600 font-semibold text-[11px] px-2 py-1.5 shadow-2xs">
          {{ barProducts.length }} {{ barProducts.length === 1 ? 'ítem' : 'ítems' }}
        </span>
      </div>

      <!-- Empty State -->
      <div
        v-if="barProducts.length === 0"
        class="text-center py-10 px-4 bg-white border border-slate-200 rounded-xl shadow-2xs my-4"
      >
        <InboxIcon class="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 class="text-sm sm:text-base font-bold text-slate-900 mb-1">
          No hay bebidas encontradas
        </h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-3">
          No encontramos opciones de bar que coincidan con "{{ searchQuery }}".
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

      <!-- Bar Products List Format (Mobile single column list, 2-column list on desktop) -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        <ProductCard
          v-for="prod in barProducts"
          :key="prod.id"
          :product="prod"
          @open-image="openProductImage"
        />
      </div>

      <!-- WhatsApp Group Subscription Card -->
      <WhatsAppSubscribeCard source-menu="bar" />

      <!-- Footer navigation return link -->
      <div class="text-center py-4">
        <button
          type="button"
          @click="goToKitchenMenu"
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-primary transition-colors cursor-pointer bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs"
        >
          <BuildingStorefrontIcon class="w-4 h-4 text-brand-primary" />
          <span>Volver a la Carta Principal de Cocina</span>
        </button>
      </div>
    </main>

    <!-- Interactive Image Modal (Lightbox) -->
    <ProductImageModal
      :is-open="isImageModalOpen"
      :product="selectedProductForImage"
      @close="closeProductImage"
    />
  </div>
</template>
