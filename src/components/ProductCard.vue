<script setup lang="ts">
import { ref } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import type { Producto } from '@/types/database'
import { CakeIcon } from '@heroicons/vue/24/outline'

const { config } = useMenuStore()

const props = defineProps<{
  product: Producto
}>()

const emit = defineEmits<{
  (e: 'open-image', product: Producto): void
}>()

const imageLoaded = ref(false)
const imageError = ref(false)

function formatPrice(val: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(val)
}

function handleImageError() {
  imageError.value = true
}
</script>

<template>
  <article :id="`product-${product.id}`"
    class="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all duration-150 flex items-center gap-3 group">
    <!-- Left: Circular Product Image -->
    <div class="shrink-0">
      <div v-if="product.imagen_url && !imageError"
        class="w-16 h-16 rounded-full overflow-hidden bg-slate-800 border-2 border-white/20 shadow-2xs">
        <img :src="product.imagen_url" :alt="product.nombre" loading="lazy" @load="imageLoaded = true"
          @error="handleImageError" class="w-full h-full object-cover"
          :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }" />
      </div>
      <!-- Placeholder -->
      <div v-else
        class="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center">
        <CakeIcon class="w-8 h-8 text-amber-400" />
      </div>
    </div>

    <!-- Right: Product Information -->
    <div class="flex-1 min-w-0">
      <!-- Product Name -->
      <h3 class="font-semibold text-slate-900 text-sm leading-tight mb-1">
        {{ product.nombre }}
      </h3>

      <!-- Product Description -->
      <p v-if="product.descripcion" class="text-xs text-slate-600 mb-2 line-clamp-2">
        {{ product.descripcion }}
      </p>

      <!-- Price -->
      <div v-if="config.mostrar_precios_carta !== false" class="flex items-baseline gap-2">
        <span class="font-bold text-amber-400 text-sm">
          {{ formatPrice(product.precio) }}
        </span>
      </div>
    </div>
  </article>
</template>
