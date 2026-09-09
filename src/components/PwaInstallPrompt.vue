<script setup lang="ts">
import { watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePwaInstall } from '@/composables/usePwaInstall'
import logoImg from '@/assets/las-delicias-logo.png'
import {
  ArrowDownTrayIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const {
  isInstalled,
  showPrompt,
  showIOSGuide,
  evaluateEligibility,
  triggerInstall,
  dismissPrompt,
  closeIOSGuide
} = usePwaInstall()

// Solo debe ser elegible en las cartas públicas (Menú principal y Bar)
const isPublicCartaRoute = computed(() => {
  const path = route.path
  if (path.startsWith('/admin') || path.startsWith('/login')) {
    return false
  }
  return path === '/' || path === '/bar' || route.name === 'public-menu' || route.name === 'public-bar'
})

// Evaluar cuando cambie la ruta pública
watch(
  () => route.path,
  () => {
    if (isPublicCartaRoute.value) {
      evaluateEligibility(2200)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (isPublicCartaRoute.value) {
    evaluateEligibility(2200)
  }
})
</script>

<template>
  <!-- Solo renderizar en rutas públicas de cartas y si no está instalada -->
  <aside v-if="isPublicCartaRoute && !isInstalled" aria-label="Instalación de aplicación">
    <!-- ═══════════════════════════════════════════════════════
         BANNER FLOTANTE DISCRETO (Android / iOS / Desktop)
         ═══════════════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
      enter-from-class="opacity-0 translate-y-8 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-6 scale-95"
    >
      <div
        v-if="showPrompt && !showIOSGuide"
        class="fixed bottom-4 left-3.5 right-3.5 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div
          class="relative bg-slate-950/95 backdrop-blur-xl text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-amber-500/30 overflow-hidden ring-1 ring-white/10"
        >
          <!-- Línea decorativa superior dorada -->
          <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"></div>

          <!-- Botón Cerrar (X) discreto -->
          <button
            type="button"
            @click="dismissPrompt"
            class="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar aviso"
            title="Ahora no"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>

          <div class="flex items-start gap-3.5 pr-6">
            <!-- Logotipo del Restaurante -->
            <div class="relative shrink-0">
              <img
                :src="logoImg"
                alt="Logo Las Delicias"
                class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain bg-slate-900 border border-amber-500/40 p-1 shadow-md"
              />
              <span class="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <!-- Contenido de Texto Solicitado -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <h3 class="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  Agrega Las Delicias Restobar
                </h3>
              </div>
              <p class="text-xs sm:text-sm text-slate-300 leading-snug mt-1">
                Ten nuestro menú siempre a la mano y accede más rápido.
              </p>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="mt-4 pt-1 flex items-center gap-2 sm:gap-3">
            <!-- Botón Principal: Instalar aplicación -->
            <button
              type="button"
              @click="triggerInstall"
              class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <ArrowDownTrayIcon class="w-4 h-4 stroke-[2.5]" />
              <span>Instalar aplicación</span>
            </button>

            <!-- Botón Secundario: Ahora no -->
            <button
              type="button"
              @click="dismissPrompt"
              class="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 transition-colors cursor-pointer shrink-0"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════
         MODAL GUÍA PARA iOS / SAFARI (iPhone & iPad)
         ═══════════════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showIOSGuide"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
        @click.self="closeIOSGuide"
      >
        <div
          class="w-full max-w-md bg-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-500/30 ring-1 ring-white/10 animate-in slide-in-from-bottom-6 duration-300"
        >
          <!-- Cabecera del Modal iOS -->
          <div class="flex items-start justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-3">
              <img
                :src="logoImg"
                alt="Logo Las Delicias"
                class="w-11 h-11 rounded-xl object-contain bg-slate-900 border border-amber-500/40 p-1"
              />
              <div>
                <h4 class="text-base font-bold text-white leading-tight">
                  Instalar en iPhone o iPad
                </h4>
                <p class="text-xs text-amber-400 mt-0.5">
                  Las Delicias Restobar • Acceso Directo
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="closeIOSGuide"
              class="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar instrucciones"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Pasos Ilustrados para iOS Safari -->
          <div class="py-4 space-y-3.5">
            <!-- Paso 1 -->
            <div class="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
              <div
                class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30"
              >
                <!-- Icono de Compartir de iOS (cuadrado con flecha hacia arriba) -->
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <div class="text-xs sm:text-sm">
                <span class="font-semibold text-white block">1. Toca el botón Compartir</span>
                <span class="text-slate-300">
                  En la barra inferior de Safari (o arriba en iPad), pulsa el icono de <strong class="text-amber-300">Compartir</strong>.
                </span>
              </div>
            </div>

            <!-- Paso 2 -->
            <div class="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
              <div
                class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30"
              >
                <!-- Icono Agregar a Inicio (cuadrado con signo más) -->
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <div class="text-xs sm:text-sm">
                <span class="font-semibold text-white block">2. Selecciona "Agregar a inicio"</span>
                <span class="text-slate-300">
                  Desliza las opciones hacia abajo y pulsa <strong class="text-amber-300">"Agregar a la pantalla de inicio"</strong>.
                </span>
              </div>
            </div>

            <!-- Paso 3 -->
            <div class="flex items-start gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
              <div
                class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30"
              >
                <CheckCircleIcon class="w-5 h-5" />
              </div>
              <div class="text-xs sm:text-sm">
                <span class="font-semibold text-white block">3. Pulsa "Agregar"</span>
                <span class="text-slate-300">
                  En la esquina superior derecha toca <strong class="text-amber-300">Agregar</strong> para crear el ícono en tu pantalla.
                </span>
              </div>
            </div>
          </div>

          <!-- Botón Cerrar / Entendido -->
          <div class="pt-2">
            <button
              type="button"
              @click="closeIOSGuide"
              class="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer shadow-lg"
            >
              ¡Listo, entendido!
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </aside>
</template>
