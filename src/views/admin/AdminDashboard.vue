<script setup lang="ts">
import { computed } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import { useMenuSchedule } from '@/composables/useMenuSchedule'
import { useVisitorTracker } from '@/composables/useVisitorTracker'
import {
  PlusIcon,
  PhotoIcon,
  ShoppingBagIcon,
  ClockIcon,
  QrCodeIcon,
  MusicalNoteIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

const {
  categories,
  products,
  config,
  activeProducts,
  unavailableProducts,
  pendingSubscriptionsCount
} = useMenuStore()

const { currentShiftCategory, currentTime } = useMenuSchedule(categories)
const { restaurantMetrics, barMetrics, qrMetrics } = useVisitorTracker()

const activeShiftsCount = computed(() => categories.value.filter(c => c.activo).length)
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1 badge badge-sm bg-brand-primary text-white border-none font-bold uppercase text-[10px] px-2 py-0.5">
            <SparklesIcon class="w-3 h-3 text-white" />
            Restobar en Vivo
          </span>
          <span class="text-xs text-slate-400 font-mono">{{ currentTime }}</span>
        </div>
        <h2 class="text-xl sm:text-2xl font-bold">
          Panel de Control — Las Delicias Restobar
        </h2>
        <p class="text-xs sm:text-sm text-slate-300 mt-1">
          Turno actual de cocina: <strong class="text-brand-accent">{{ currentShiftCategory?.nombre || 'Fuera de turno' }}</strong>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <router-link
          to="/admin/productos"
          class="btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs flex items-center gap-1.5"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Agregar Producto</span>
        </router-link>
        <router-link
          to="/admin/flyers"
          class="btn btn-sm btn-outline border-slate-600 text-slate-200 hover:bg-white hover:text-slate-900 rounded-xl text-xs flex items-center gap-1.5"
        >
          <PhotoIcon class="w-4 h-4" />
          <span>Generar Flyers</span>
        </router-link>
      </div>
    </div>

    <!-- Quick Stat Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-semibold">Total Platos</span>
          <ShoppingBagIcon class="w-5 h-5 text-slate-400" />
        </div>
        <div class="text-2xl font-bold text-slate-900">{{ products.length }}</div>
        <div class="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
          <span class="text-emerald-600 font-medium">{{ activeProducts.length }} activos</span>
          <span>•</span>
          <span class="text-amber-600 font-medium">{{ unavailableProducts.length }} agotados</span>
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-semibold">Cartas & Horarios</span>
          <ClockIcon class="w-5 h-5 text-slate-400" />
        </div>
        <div class="text-2xl font-bold text-slate-900">{{ activeShiftsCount }} / {{ categories.length }}</div>
        <div class="text-[11px] text-slate-500 mt-1">
          Turnos configurados
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-semibold">Precios en Cartas</span>
          <TagIcon class="w-5 h-5 text-slate-400" />
        </div>
        <div class="text-lg font-bold" :class="config.mostrar_precios_carta !== false ? 'text-emerald-600' : 'text-slate-400'">
          {{ config.mostrar_precios_carta !== false ? 'Visibles' : 'Ocultos' }}
        </div>
        <div class="text-[11px] text-slate-500 mt-1">
          Flyers: {{ config.mostrar_precios_flyers !== false ? 'Con precios' : 'Sin precios' }}
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-semibold">Música Ambiental</span>
          <MusicalNoteIcon class="w-5 h-5 text-slate-400" />
        </div>
        <div class="text-lg font-bold" :class="config.musica_activa ? 'text-emerald-600' : 'text-slate-400'">
          {{ config.musica_activa ? 'Habilitada' : 'Desactivada' }}
        </div>
        <div class="text-[11px] text-slate-500 mt-1">
          Volumen: {{ config.musica_volumen }}%
        </div>
      </div>
    </div>

    <!-- Panel de Métricas e Información en Tiempo Real (Explicativo y 100% Intuitivo) -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ChartBarIcon class="w-5 h-5 text-brand-primary" />
            <span>Resumen de Visitas y Afluencia de Clientes</span>
          </h3>
          <p class="text-xs text-slate-500">
            Métricas reales de clientes en el salón y visitantes web. El sistema filtra recargas continuas para no inflar los números.
          </p>
        </div>

        <router-link
          to="/admin/suscriptores"
          class="btn btn-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <UserGroupIcon class="w-3.5 h-3.5 text-emerald-600" />
          <span>{{ pendingSubscriptionsCount }} Clientes esperando invitación</span>
          <ArrowRightIcon class="w-3 h-3 text-emerald-600" />
        </router-link>
      </div>

      <!-- Grid de 2 Bloques Principales: Restaurante y Bar -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Bloque 1: Carta del Restaurante (Cocina) -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div class="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
                <BuildingStorefrontIcon class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm">Carta del Restaurante (Cocina)</h4>
                <p class="text-[11px] text-slate-500">
                  Personas que abrieron el menú de Desayunos, Almuerzos o Cenas
                </p>
              </div>
            </div>
            <span class="badge badge-sm bg-orange-50 text-orange-700 border-orange-200 text-[10px] font-bold shrink-0">
              Enlace: /
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hoy</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ restaurantMetrics.today }}</p>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-tight">Visitas hoy</p>
            </div>

            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">7 Días</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ restaurantMetrics.last7Days }}</p>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-tight">Última semana</p>
            </div>

            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">30 Días</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ restaurantMetrics.last30Days }}</p>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-tight">Último mes</p>
            </div>

            <div class="bg-orange-50/70 p-2.5 rounded-xl border border-orange-200">
              <p class="text-[10px] text-orange-700 font-bold uppercase tracking-wider">Total</p>
              <p class="text-xl font-black text-orange-600 mt-0.5">{{ restaurantMetrics.total }}</p>
              <p class="text-[9px] text-orange-700/80 mt-0.5 leading-tight">Aperturas totales</p>
            </div>
          </div>

          <!-- Origen de las visitas a Cocina -->
          <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span class="text-slate-500 text-[11px]">¿Desde dónde abrieron la carta?</span>
            <div class="flex flex-wrap gap-1.5">
              <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                📱 Escaneo QR: <strong>{{ restaurantMetrics.sources.qr || 0 }}</strong>
              </span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                🔗 Enlace Directo: <strong>{{ restaurantMetrics.sources.direct || 0 }}</strong>
              </span>
              <span v-if="restaurantMetrics.sources.social" class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                🌐 Redes: <strong>{{ restaurantMetrics.sources.social }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Bloque 2: Carta del Bar & Coctelería -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div class="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                <SparklesIcon class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm">Carta del Bar & Coctelería</h4>
                <p class="text-[11px] text-slate-500">
                  Clientes que consultaron tragos de autor, cervezas y bebidas
                </p>
              </div>
            </div>
            <span class="badge badge-sm bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold shrink-0">
              Enlace: /bar
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hoy</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ barMetrics.today }}</p>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-tight">Visitas hoy</p>
            </div>

            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">7 Días</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ barMetrics.last7Days }}</p>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-tight">Última semana</p>
            </div>

            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">30 Días</p>
              <p class="text-xl font-black text-slate-900 mt-0.5">{{ barMetrics.last30Days }}</p>
              <p class="text-[9px] text-slate-400 mt-0.5 leading-tight">Último mes</p>
            </div>

            <div class="bg-purple-50/70 p-2.5 rounded-xl border border-purple-200">
              <p class="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Total</p>
              <p class="text-xl font-black text-purple-600 mt-0.5">{{ barMetrics.total }}</p>
              <p class="text-[9px] text-purple-700/80 mt-0.5 leading-tight">Aperturas totales</p>
            </div>
          </div>

          <!-- Origen de las visitas a Bar -->
          <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span class="text-slate-500 text-[11px]">¿Desde dónde abrieron el bar?</span>
            <div class="flex flex-wrap gap-1.5">
              <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                📱 Escaneo QR: <strong>{{ barMetrics.sources.qr || 0 }}</strong>
              </span>
              <span class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                🔗 Enlace Directo: <strong>{{ barMetrics.sources.direct || 0 }}</strong>
              </span>
              <span v-if="barMetrics.sources.social" class="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                🌐 Redes: <strong>{{ barMetrics.sources.social }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bloque 3: Escaneos de Códigos QR de las Cartas Públicas -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <QrCodeIcon class="w-5 h-5" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Escaneos de Códigos QR de las Cartas Públicas</h4>
              <p class="text-[11px] text-slate-500">
                Personas que usaron la cámara de su celular para abrir las cartas digitales públicas
              </p>
            </div>
          </div>

          <router-link
            to="/admin/qr"
            class="btn btn-xs btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver Códigos QR Oficiales</span>
            <ArrowRightIcon class="w-3 h-3" />
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Total Escaneos QR -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center justify-between text-slate-500 mb-1">
              <span class="text-xs font-semibold text-slate-700">Total de Escaneos QR</span>
              <QrCodeIcon class="w-4 h-4 text-blue-500" />
            </div>
            <p class="text-2xl font-black text-slate-900">{{ qrMetrics.totalScans }}</p>
            <p class="text-[11px] text-slate-500 mt-1">
              Lecturas presenciales de códigos QR registradas en las cartas públicas.
            </p>
          </div>

          <!-- Escaneos Hoy -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center justify-between text-slate-500 mb-1">
              <span class="text-xs font-semibold text-slate-700">Escaneos Hoy</span>
              <ClockIcon class="w-4 h-4 text-emerald-500" />
            </div>
            <p class="text-2xl font-black text-emerald-600">{{ qrMetrics.todayScans }}</p>
            <p class="text-[11px] text-slate-500 mt-1">
              Clientes que han escaneado el código QR durante el día de hoy.
            </p>
          </div>

          <!-- Carta Más Consultada por QR -->
          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center justify-between text-slate-500 mb-1">
              <span class="text-xs font-semibold text-slate-700">Carta Más Escaneada</span>
              <SparklesIcon class="w-4 h-4 text-amber-500" />
            </div>
            <p class="text-lg font-black text-slate-900 truncate">
              {{ qrMetrics.scansBar > qrMetrics.scansRestaurant ? 'Carta del Bar' : 'Carta Principal' }}
            </p>
            <p class="text-[11px] text-slate-500 mt-1">
              {{ qrMetrics.scansBar > qrMetrics.scansRestaurant ? `${qrMetrics.scansBar} escaneos al Bar` : `${qrMetrics.scansRestaurant} escaneos a Restaurante` }}
            </p>
          </div>
        </div>

        <!-- Desglose por Carta Pública -->
        <div class="pt-2 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Escaneos por Carta Pública:</p>
          <div class="flex flex-wrap gap-2">
            <div class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
              <span class="font-medium text-slate-700">Carta Principal (Restaurante):</span>
              <span class="font-bold text-blue-600">{{ qrMetrics.scansRestaurant }} escaneos</span>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
              <span class="font-medium text-slate-700">Carta del Bar (Coctelería):</span>
              <span class="font-bold text-amber-600">{{ qrMetrics.scansBar }} escaneos</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acceso Rápido a Módulos Principales -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Card 1: Productos -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-orange-50 text-brand-primary flex items-center justify-center mb-3">
            <ShoppingBagIcon class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base mb-1">Gestión de Productos</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Administra nombres, precios, asignación de cartas, URLs de imágenes y alternar platos disponibles o agotados al instante.
          </p>
        </div>
        <router-link
          to="/admin/productos"
          class="mt-4 btn btn-sm btn-outline border-slate-300 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5"
        >
          <span>Gestionar Productos</span>
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <!-- Card 2: Códigos QR de Cartas -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <QrCodeIcon class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base mb-1">Códigos QR de las Cartas</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Descarga los códigos QR oficiales para la Carta Principal (/) y la Carta del Bar (/bar) listos para imprimir en alta resolución.
          </p>
        </div>
        <router-link
          to="/admin/qr"
          class="mt-4 btn btn-sm btn-outline border-slate-300 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5"
        >
          <span>Ver Códigos QR</span>
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </router-link>
      </div>

      <!-- Card 3: Flyers y Redes -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <PhotoIcon class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-slate-900 text-base mb-1">Descargar Flyers de Cartas</h3>
          <p class="text-xs text-slate-500 leading-relaxed">
            Genera y descarga imágenes de alta resolución de la carta de Desayuno, Almuerzo, Cena o Bar para tus estados de WhatsApp y redes.
          </p>
        </div>
        <router-link
          to="/admin/flyers"
          class="mt-4 btn btn-sm btn-outline border-slate-300 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5"
        >
          <span>Crear y Descargar</span>
          <ArrowRightIcon class="w-3.5 h-3.5" />
        </router-link>
      </div>
    </div>
  </div>
</template>
