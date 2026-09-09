<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Producto } from '@/types/database'
import { XMarkIcon, PhotoIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  product: Producto | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const imageLoaded = ref(false)

function formatPrice(val: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(val)
}

function handleClose() {
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

watch(() => props.product, () => {
  imageLoaded.value = false
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen && product"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        aria-modal="true"
        role="dialog"
      >
        <!-- Backdrop Blur Overlay -->
        <div
          class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          @click="handleClose"
        ></div>

        <!-- Modal Container -->
        <div
          class="relative w-full max-w-lg bg-white rounded-3xl shadow-modal overflow-hidden z-10 border border-slate-100 flex flex-col max-h-[90vh] animate-scale-up"
        >
          <!-- Close Button Top Right -->
          <button
            type="button"
            @click="handleClose"
            class="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm focus:outline-none cursor-pointer"
            title="Cerrar vista de imagen"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>

          <!-- Image Container -->
          <div class="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-slate-100 flex items-center justify-center overflow-hidden">
            <!-- Spinner / Shimmer loading -->
            <div
              v-if="!imageLoaded"
              class="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400"
            >
              <svg class="w-8 h-8 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>

            <img
              v-if="product.imagen_url"
              :src="product.imagen_url"
              :alt="product.nombre"
              @load="imageLoaded = true"
              class="w-full h-full object-cover transition-opacity duration-300"
              :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
            />

            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center"
            >
              <PhotoIcon class="w-12 h-12 mb-2 text-slate-300" />
              <p class="text-xs font-medium">Vista previa no disponible</p>
            </div>
          </div>

          <!-- Modal Details Header -->
          <div class="p-4 sm:p-5 bg-white flex items-center justify-between gap-3 border-t border-slate-100">
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-slate-900 text-base sm:text-lg truncate">
                {{ product.nombre }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Las Delicias Restobar
              </p>
            </div>

            <!-- Price Highlight Badge -->
            <div class="shrink-0">
              <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-base sm:text-lg border border-brand-primary/20">
                {{ formatPrice(product.precio) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>


<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-up {
  animation: scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
