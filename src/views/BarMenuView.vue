<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore } from '@/composables/useMenuStore'
import { useVisitorTracker } from '@/composables/useVisitorTracker'
import { usePageMeta } from '@/composables/usePageMeta'
import HeaderMenu from '@/components/HeaderMenu.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductImageModal from '@/components/ProductImageModal.vue'
import type { Producto } from '@/types/database'
import {
  InboxIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const { categories, products } = useMenuStore()
const { trackVisit } = useVisitorTracker()

// ─── MENÚ Y PRODUCTOS ─────────────────────────────────────────────────────────
const selectedProductForImage = ref<Producto | null>(null)
const isImageModalOpen = ref(false)
const searchQuery = ref('')

const currentTime = ref(
  new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
)

// Timer para actualizar el reloj cada segundo
let timer: number | null = null

onMounted(() => {
  trackVisit('bar', route.query)

  usePageMeta({
    title: 'Bar & Coctelería | Las Delicias Restobar',
    description: '\uD83C\uDF79 Descubre nuestra carta de tragos, cocteles y bebidas artesanales. Ambiente, música y los mejores sabores de Las Delicias Restobar.',
    url: 'https://lasdelicias.onrender.com/bar'
  })

  timer = window.setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Filtrar productos por categoría del Bar
const filteredBarProducts = computed(() => {
  return products.value.filter(p => p.categoria_id === barCategory.value?.id)
})

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
</script>

<template>
  <!-- Fondo oscuro del Bar - compacto como MenuView -->
  <div class="min-h-screen bg-[#0d0d1a] flex flex-col justify-between"
    style="background: linear-gradient(160deg, #0d0d1a 0%, #0f1424 50%, #0a0d18 100%)">
    <!-- Header compartido con estilo Bar -->
    <HeaderMenu :current-time="currentTime" current-shift-name="Bar & Coctelería" :is-realtime-connected="true"
      :is-supabase-configured="false" v-model:search-query="searchQuery" :dark-mode="true">
    </HeaderMenu>

    <!-- Main Content compacto -->
    <main class="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-4 pb-20">

      <!-- Header de sección compacto -->
      <div class="my-2 flex items-center justify-between border-b border-white/10 pb-2">
        <div>
          <h2 class="text-lg font-bold text-white">
            Carta del Bar
          </h2>
          <p class="text-[11px] text-slate-400 mt-0.5">
            Servicio continuo 24/7
          </p>
        </div>
        <div class="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
          <span class="text-xs font-semibold text-slate-800">{{ currentTime }}</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredBarProducts.length === 0"
        class="text-center py-10 px-4 bg-white/5 border border-white/10 rounded-xl">
        <InboxIcon class="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <h3 class="text-sm font-bold text-slate-300 mb-1">No hay bebidas</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto mb-3">
          Esta categoría está vacía.
        </p>
      </div>

      <!-- Product Cards - usando ProductCard compartido -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <ProductCard v-for="prod in filteredBarProducts" :key="prod.id" :product="prod"
          @open-image="openProductImage" />
      </div>

      <!-- Botón volver al menú principal -->
      <div class="mt-4 text-center">
        <router-link to="/"
          class="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors bg-white/6 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/12">
          <ArrowLeftIcon class="w-4 h-4" />
          <span>Volver al menú principal</span>
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
    <ProductImageModal :is-open="isImageModalOpen" :product="selectedProductForImage" @close="closeProductImage" />
  </div>
</template>

<style scoped>
/* Override para que el buscador nativo del browser se vea bien en dark */
input[type="search"]::-webkit-search-cancel-button {
  filter: invert(1) opacity(0.4);
}
</style>
