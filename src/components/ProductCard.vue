<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import type { Producto } from '@/types/database'

const { config, categories } = useMenuStore()

const props = defineProps<{
  product: Producto
  darkMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-image', product: Producto): void
}>()

const imageLoaded = ref(false)
const imageError = ref(false)

const mealType = computed<'desayuno' | 'almuerzo' | 'cena' | 'bebida' | 'comida'>(() => {
  const cat = categories.value.find(c => c.id === props.product.categoria_id)
  const catName = (cat?.nombre || '').toLowerCase()
  const prodName = (props.product.nombre || '').toLowerCase()

  if (catName.includes('desayuno') || prodName.includes('jugo') || prodName.includes('bebida') || prodName.includes('cafe') || prodName.includes('café') || prodName.includes('infusion')) {
    return 'desayuno'
  }
  if (catName.includes('almuerzo')) {
    return 'almuerzo'
  }
  if (catName.includes('cena')) {
    return 'cena'
  }
  if (catName.includes('bar') || catName.includes('coctel') || prodName.includes('trago') || prodName.includes('cerveza')) {
    return 'bebida'
  }
  return 'comida'
})

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
      <!-- Placeholder por tipo de comida (sin tortas) -->
      <div v-else
        class="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/30 flex items-center justify-center"
        :title="product.nombre">
        <!-- Desayuno: Jugos o bebidas frescas con sorbete -->
        <svg v-if="mealType === 'desayuno'" class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M6.5 6.5h11l-1.3 12.2a2 2 0 0 1-1.99 1.8H9.79a2 2 0 0 1-1.99-1.8L6.5 6.5z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 11.5h9" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 2.5l-2.5 4" />
        </svg>

        <!-- Almuerzo: Plato de comida / Cloche de almuerzo -->
        <svg v-else-if="mealType === 'almuerzo'" class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 18.5h18" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 18.5a7 7 0 0 1 14 0" />
          <circle cx="12" cy="8.5" r="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5.5c.5-.7 1.5-.7 2 0m2 0c.5-.7 1.5-.7 2 0" />
        </svg>

        <!-- Cena: Plato de cena con cubiertos -->
        <svg v-else-if="mealType === 'cena'" class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <circle cx="12" cy="12" r="6" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="3.2" stroke-linecap="round" stroke-linejoin="round" />
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M4 6v3.5a1.5 1.5 0 0 0 1.5 1.5v7m-1.5-12h3v3.5a1.5 1.5 0 0 1-1.5 1.5" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 6v12m0-12a1.5 1.5 0 0 1 1.5 1.5v4.5a1 1 0 0 1-1.5 1" />
        </svg>

        <!-- Bebida / Bar / Coctelería -->
        <svg v-else-if="mealType === 'bebida'" class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 20.5h8m-4-7.5v7.5m-5.5-13l5.5 5.5 5.5-5.5H6.5z" />
          <circle cx="14.5" cy="5.5" r="1" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <!-- General / Otro tipo de plato -->
        <svg v-else class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke-width="1.5" stroke="currentColor">
          <circle cx="12" cy="12" r="6.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="3.5" stroke-linecap="round" stroke-linejoin="round" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 18.5h17" />
        </svg>
      </div>
    </div>

    <!-- Right: Product Information -->
    <div class="flex-1 min-w-0">
      <!-- Product Name -->
      <h3 class="font-semibold text-sm leading-tight mb-1" :class="darkMode ? 'text-white' : 'text-slate-900'">
        {{ product.nombre }}
      </h3>

      <!-- Product Description -->
      <p v-if="product.descripcion" class="text-xs mb-2 line-clamp-2" :class="darkMode ? 'text-slate-300' : 'text-slate-600'">
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
