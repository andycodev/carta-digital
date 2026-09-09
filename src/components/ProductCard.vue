<script setup lang="ts">
import { ref } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import type { Producto } from '@/types/database'
import { MagnifyingGlassPlusIcon, CakeIcon } from '@heroicons/vue/24/outline'

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

function triggerImageClick() {
  if (props.product.imagen_url && !imageError.value) {
    emit('open-image', props.product)
  }
}
</script>

<template>
  <article
    :id="`product-${product.id}`"
    class="bg-white border border-slate-200/80 hover:border-brand-primary/40 rounded-xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all duration-150 flex items-center justify-between gap-3 group"
  >
    <!-- Left: Product Information (Name & Price - Main Focus) -->
    <div class="flex-1 min-w-0">
      <!-- Product Name -->
      <h3 class="font-semibold text-slate-900 text-sm sm:text-[15px] leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">
        {{ product.nombre }}
      </h3>

      <!-- Optional Product Description (Only if enabled and exists) -->
      <p
        v-if="product.mostrar_descripcion && product.descripcion"
        class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal"
      >
        {{ product.descripcion }}
      </p>

      <!-- Price (Controlled by config.mostrar_precios_carta) -->
      <div v-if="config.mostrar_precios_carta !== false" class="mt-1 flex items-baseline gap-2">
        <span class="font-bold text-sm sm:text-base text-brand-primary tracking-tight">
          {{ formatPrice(product.precio) }}
        </span>
      </div>
    </div>

    <!-- Right: Interactive Thumbnail or Clean Food Icon Placeholder -->
    <div class="shrink-0">
      <!-- Clickable Photo Thumbnail -->
      <button
        v-if="product.imagen_url && !imageError"
        type="button"
        @click="triggerImageClick"
        class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs hover:shadow-sm active:scale-95 transition-all duration-150 group/thumb focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
        title="Toca para ver la foto ampliada"
        aria-label="Ver imagen del producto en tamaño grande"
      >
        <!-- Skeleton spinner -->
        <div
          v-if="!imageLoaded"
          class="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300"
        >
          <svg class="w-3.5 h-3.5 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <img
          :src="product.imagen_url"
          :alt="product.nombre"
          loading="lazy"
          @load="imageLoaded = true"
          @error="handleImageError"
          class="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
          :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
        />

        <!-- Heroicon badge icon indicating clickable photo -->
        <div class="absolute bottom-0.5 right-0.5 bg-black/60 rounded p-0.5 text-white">
          <MagnifyingGlassPlusIcon class="w-2.5 h-2.5" />
        </div>
      </button>

      <!-- Clean Placeholder with Food Icon from Heroicons -->
      <div
        v-else
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-50/80 border border-orange-200/70 shadow-2xs flex items-center justify-center text-brand-primary transition-colors"
        title="Plato de Las Delicias Restobar"
      >
        <CakeIcon class="w-6 h-6 text-brand-primary/80" />
      </div>
    </div>
  </article>
</template>



