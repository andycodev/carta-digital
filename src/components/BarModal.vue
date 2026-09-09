<script setup lang="ts">
import { ref } from 'vue'
import { SparklesIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  barCategoryId?: string
}>()

const emit = defineEmits<{
  (e: 'navigate-to-bar', barCatId: string): void
}>()

const modalRef = ref<HTMLDialogElement | null>(null)

function openModal() {
  if (modalRef.value) {
    modalRef.value.showModal()
  } else {
    const dialog = document.getElementById('modal_bar') as HTMLDialogElement
    dialog?.showModal()
  }
}

function closeModal() {
  if (modalRef.value) {
    modalRef.value.close()
  } else {
    const dialog = document.getElementById('modal_bar') as HTMLDialogElement
    dialog?.close()
  }
}

function goToBarCategory() {
  closeModal()
  if (props.barCategoryId) {
    emit('navigate-to-bar', props.barCategoryId)
  }
}

defineExpose({
  openModal,
  closeModal
})
</script>

<template>
  <div>
    <!-- Floating Bottom Promo Bar -->
    <div class="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-30">
      <button
        id="btn-open-bar-modal"
        type="button"
        @click="openModal"
        class="bg-slate-900/95 hover:bg-slate-800 text-white font-semibold shadow-lg hover:shadow-xl rounded-full px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center gap-1.5 group transition-all duration-150 hover:scale-105 active:scale-95 border border-slate-700/80 backdrop-blur-xs text-xs cursor-pointer"
      >
        <SparklesIcon class="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-150" />
        <span class="font-medium tracking-tight">Zona Bar</span>
      </button>
    </div>

    <!-- Native DaisyUI Modal Dialog -->
    <dialog id="modal_bar" ref="modalRef" class="modal modal-bottom sm:modal-middle bg-slate-950/60 backdrop-blur-sm">
      <div class="modal-box bg-white border border-slate-200 p-0 max-w-lg overflow-hidden shadow-2xl rounded-3xl text-slate-800">
        <!-- Close button on top-right -->
        <button
          type="button"
          @click="closeModal"
          class="btn btn-sm btn-circle btn-ghost absolute right-3.5 top-3.5 z-20 text-white bg-slate-900/60 hover:bg-slate-900/80 border-none shadow-sm cursor-pointer"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>

        <!-- Video Player Showcase -->
        <div class="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
          <video
            autoplay
            muted
            loop
            playsinline
            preload="auto"
            poster="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80"
            class="w-full h-full object-cover"
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
              type="video/mp4"
            />
            Tu navegador no soporta el elemento de video.
          </video>

          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

          <!-- Video badge -->
          <div class="absolute bottom-3 left-4 flex items-center gap-1.5">
            <span class="badge bg-amber-500 text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
              <SparklesIcon class="w-3 h-3" />
              <span>En Vivo • Mixología</span>
            </span>
          </div>
        </div>

        <!-- Modal Text Content -->
        <div class="p-5 sm:p-6">
          <div class="flex items-center gap-1.5 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <SparklesIcon class="w-3.5 h-3.5" />
            <span>Las Delicias Restobar</span>
          </div>

          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Bar & Coctelería de Autor
          </h3>

          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            Disfruta de nuestra selección de cócteles artesanales, macerados especiales, destilados premium y opciones sin alcohol. ¡Servicio continuo!
          </p>

          <!-- Modal Action buttons -->
          <div class="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="btn-modal-view-bar"
              type="button"
              @click="goToBarCategory"
              class="btn btn-primary w-full sm:flex-1 bg-brand-primary hover:bg-brand-primary-hover border-none text-white font-bold rounded-xl shadow-md text-xs sm:text-sm py-2.5 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explorar Carta del Bar</span>
              <ArrowRightIcon class="w-4 h-4" />
            </button>

            <button
              type="button"
              @click="closeModal"
              class="btn btn-ghost w-full sm:w-auto text-slate-600 hover:text-slate-900 rounded-xl text-xs sm:text-sm cursor-pointer"
            >
              Continuar viendo carta
            </button>
          </div>
        </div>
      </div>

      <!-- Backdrop click to close -->
      <form method="dialog" class="modal-backdrop">
        <button @click="closeModal">close</button>
      </form>
    </dialog>
  </div>
</template>


