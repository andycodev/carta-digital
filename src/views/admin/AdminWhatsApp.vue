<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import type { WhatsAppSubscriptionStatus, WhatsAppSubscriber } from '@/types/database'
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const {
  whatsappSubscriptions,
  updateWhatsAppSubscriptionStatus,
  deleteWhatsAppSubscription,
  exportSubscribersToCSV
} = useMenuStore()

const searchQuery = ref('')
const selectedStatusFilter = ref<string>('all')
const selectedSourceFilter = ref<'all' | 'main' | 'bar'>('all')

const statusOptions: { value: WhatsAppSubscriptionStatus, label: string, color: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'contacted', label: 'Contactado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'joined', label: 'Agregado al grupo', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'rejected', label: 'Rechazado', color: 'bg-red-100 text-red-800 border-red-200' }
]

const stats = computed(() => {
  const all = whatsappSubscriptions.value as WhatsAppSubscriber[]
  return {
    total: all.length,
    pending: all.filter((s: WhatsAppSubscriber) => s.status === 'pending').length,
    contacted: all.filter((s: WhatsAppSubscriber) => s.status === 'contacted').length,
    joined: all.filter((s: WhatsAppSubscriber) => s.status === 'joined').length,
    rejected: all.filter((s: WhatsAppSubscriber) => s.status === 'rejected').length,
    main: all.filter((s: WhatsAppSubscriber) => (s.source_menu || 'main') === 'main').length,
    bar: all.filter((s: WhatsAppSubscriber) => s.source_menu === 'bar').length
  }
})

const filteredSubscriptions = computed(() => {
  let list = whatsappSubscriptions.value as WhatsAppSubscriber[]

  if (selectedStatusFilter.value !== 'all') {
    list = list.filter((s: WhatsAppSubscriber) => s.status === selectedStatusFilter.value)
  }

  if (selectedSourceFilter.value !== 'all') {
    list = list.filter((s: WhatsAppSubscriber) => (s.source_menu || 'main') === selectedSourceFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter((s: WhatsAppSubscriber) =>
      s.phone.includes(q) ||
      (s.name && s.name.toLowerCase().includes(q))
    )
  }

  return list
})

function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 9) {
    return `${clean.substring(0, 3)} ${clean.substring(3, 6)} ${clean.substring(6)}`
  }
  return phone
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return isoDate
  }
}

function getStatusBadge(status: WhatsAppSubscriptionStatus) {
  const match = statusOptions.find(o => o.value === status)
  return match || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' }
}

function openWhatsAppChat(phone: string, name: string | null) {
  const clean = phone.replace(/\D/g, '')
  const intlPhone = clean.startsWith('51') ? clean : `51${clean}`
  const clientName = name ? ` ${name}` : ''
  const message = encodeURIComponent(
    `¡Hola${clientName}! Te saludamos de Las Delicias Restobar 🍽️✨. Recibimos tu solicitud para unirte a nuestro grupo de WhatsApp sobre novedades, menús y promociones especiales. ¿Deseas que te enviemos el enlace oficial de invitación?`
  )
  window.open(`https://wa.me/${intlPhone}?text=${message}`, '_blank')
}

function handleStatusChange(id: string, newStatus: WhatsAppSubscriptionStatus) {
  updateWhatsAppSubscriptionStatus(id, newStatus)
}

function handleDelete(id: string, phone: string) {
  if (confirm(`¿Estás seguro de eliminar el registro del número ${phone}?`)) {
    deleteWhatsAppSubscription(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserGroupIcon class="w-6 h-6 text-brand-primary" />
          <span>Suscriptores al Grupo de WhatsApp</span>
        </h2>
        <p class="text-xs text-slate-500">
          Clientes que solicitaron voluntariamente recibir novedades y menús de Las Delicias Restobar.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="exportSubscribersToCSV"
          class="btn btn-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
          title="Descargar lista de suscriptores en formato CSV para Excel o Google Sheets"
        >
          <ArrowDownTrayIcon class="w-4 h-4 text-slate-600" />
          <span>Exportar a CSV</span>
        </button>

        <div class="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-emerald-600" />
          <span>{{ stats.pending }} pendientes</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        @click="selectedStatusFilter = 'pending'"
        class="bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs"
        :class="selectedStatusFilter === 'pending' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">Pendientes</span>
          <ClockIcon class="w-4 h-4 text-amber-500" />
        </div>
        <p class="text-2xl font-bold text-amber-600 mt-1">{{ stats.pending }}</p>
      </div>

      <div
        @click="selectedStatusFilter = 'contacted'"
        class="bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs"
        :class="selectedStatusFilter === 'contacted' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">Contactados</span>
          <ChatBubbleLeftRightIcon class="w-4 h-4 text-blue-500" />
        </div>
        <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.contacted }}</p>
      </div>

      <div
        @click="selectedStatusFilter = 'joined'"
        class="bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs"
        :class="selectedStatusFilter === 'joined' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-slate-300'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">Agregados</span>
          <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
        </div>
        <p class="text-2xl font-bold text-emerald-600 mt-1">{{ stats.joined }}</p>
      </div>

      <div
        @click="selectedStatusFilter = 'all'"
        class="bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs"
        :class="selectedStatusFilter === 'all' ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">Total Registrados</span>
          <UserGroupIcon class="w-4 h-4 text-slate-500" />
        </div>
        <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.total }}</p>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative w-full lg:w-72">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <MagnifyingGlassIcon class="w-4 h-4" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por celular o nombre..."
          class="input input-sm w-full pl-9 rounded-xl border-slate-200 bg-slate-50/60 focus:bg-white text-xs"
        />
      </div>

      <!-- Filter Controls (Source Menu and Status) -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Source Menu Segmented Filter -->
        <div class="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs">
          <button
            type="button"
            @click="selectedSourceFilter = 'all'"
            class="px-2.5 py-1 rounded-lg transition-all text-xs"
            :class="selectedSourceFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
          >
            Todas
          </button>
          <button
            type="button"
            @click="selectedSourceFilter = 'main'"
            class="px-2.5 py-1 rounded-lg transition-all text-xs"
            :class="selectedSourceFilter === 'main' ? 'bg-white text-orange-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
          >
            Principal ({{ stats.main }})
          </button>
          <button
            type="button"
            @click="selectedSourceFilter = 'bar'"
            class="px-2.5 py-1 rounded-lg transition-all text-xs"
            :class="selectedSourceFilter === 'bar' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'"
          >
            Bar ({{ stats.bar }})
          </button>
        </div>

        <!-- Status Filter Buttons -->
        <div class="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
          <FunnelIcon class="w-4 h-4 text-slate-400 shrink-0 hidden sm:block mr-0.5" />
          <button
            type="button"
            @click="selectedStatusFilter = 'all'"
            class="btn btn-xs rounded-lg text-xs"
            :class="selectedStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'btn-ghost text-slate-600'"
          >
            Todos
          </button>
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            type="button"
            @click="selectedStatusFilter = opt.value"
            class="btn btn-xs rounded-lg text-xs"
            :class="selectedStatusFilter === opt.value ? 'bg-slate-900 text-white' : 'btn-ghost text-slate-600'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Subscribers Table / Cards -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div v-if="filteredSubscriptions.length === 0" class="p-10 text-center text-slate-400 space-y-2">
        <UserGroupIcon class="w-10 h-10 mx-auto text-slate-300" />
        <p class="text-sm font-semibold text-slate-600">No se encontraron solicitudes</p>
        <p class="text-xs text-slate-400">
          {{ searchQuery ? `Sin resultados para "${searchQuery}"` : 'Aún no hay clientes registrados con este criterio.' }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table table-sm w-full text-left">
          <thead>
            <tr class="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th class="py-3 px-4">Cliente</th>
              <th class="py-3 px-4">Celular</th>
              <th class="py-3 px-4">Carta de Origen</th>
              <th class="py-3 px-4">Fecha de Registro</th>
              <th class="py-3 px-4">Estado</th>
              <th class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <tr
              v-for="sub in filteredSubscriptions"
              :key="sub.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- Name & Consent -->
              <td class="py-3 px-4">
                <div class="font-bold text-slate-900">
                  {{ sub.name || 'Cliente anónimo' }}
                </div>
                <div class="inline-flex items-center gap-1 text-[10px] text-emerald-700">
                  <CheckCircleIcon class="w-3 h-3 text-emerald-500" />
                  <span>Consentimiento verificado</span>
                </div>
              </td>

              <!-- Phone -->
              <td class="py-3 px-4 font-mono font-bold text-slate-800 text-xs">
                {{ formatPhoneDisplay(sub.phone) }}
              </td>

              <!-- Source Menu Badge -->
              <td class="py-3 px-4">
                <span
                  v-if="sub.source_menu === 'bar'"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>Carta del Bar</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>Carta Principal</span>
                </span>
              </td>

              <!-- Date -->
              <td class="py-3 px-4 text-slate-500 text-[11px]">
                {{ formatDate(sub.created_at) }}
              </td>

              <!-- Status Dropdown -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <select
                    :value="sub.status"
                    @change="handleStatusChange(sub.id, ($event.target as HTMLSelectElement).value as WhatsAppSubscriptionStatus)"
                    class="select select-xs rounded-lg border-slate-200 font-semibold text-[11px] cursor-pointer"
                    :class="getStatusBadge(sub.status).color"
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </td>

              <!-- Action buttons -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="openWhatsAppChat(sub.phone, sub.name)"
                    class="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 text-[11px] shadow-2xs cursor-pointer"
                    title="Abrir chat en WhatsApp Web / App"
                  >
                    <ChatBubbleLeftRightIcon class="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                    <ArrowTopRightOnSquareIcon class="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    @click="handleDelete(sub.id, sub.phone)"
                    class="btn btn-xs btn-ghost text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1 cursor-pointer"
                    title="Eliminar registro"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
