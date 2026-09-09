<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import type { Producto } from '@/types/database'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CakeIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const {
  categories,
  products,
  addProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability
} = useMenuStore()

const searchQuery = ref('')
const filterCategoryId = ref<string>('all')

// Modal State
const isModalOpen = ref(false)
const isEditing = ref(false)
const currentEditId = ref<string | null>(null)

const form = ref({
  nombre: '',
  categoria_id: '',
  precio: 0,
  descripcion: '',
  mostrar_descripcion: true,
  imagen_url: '',
  disponible: true
})

const filteredProducts = computed(() => {
  let list = products.value

  if (filterCategoryId.value !== 'all') {
    list = list.filter(p => p.categoria_id === filterCategoryId.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(p => p.nombre.toLowerCase().includes(q))
  }

  return list
})

function getCategoryName(catId: string): string {
  const cat = categories.value.find(c => c.id === catId)
  return cat ? cat.nombre : 'Sin categoría'
}

function openCreateModal() {
  isEditing.value = false
  currentEditId.value = null
  form.value = {
    nombre: '',
    categoria_id: categories.value[0]?.id || '',
    precio: 20.00,
    descripcion: '',
    mostrar_descripcion: true,
    imagen_url: '',
    disponible: true
  }
  isModalOpen.value = true
}

function openEditModal(prod: Producto) {
  isEditing.value = true
  currentEditId.value = prod.id
  form.value = {
    nombre: prod.nombre,
    categoria_id: prod.categoria_id,
    precio: prod.precio,
    descripcion: prod.descripcion || '',
    mostrar_descripcion: prod.mostrar_descripcion !== false,
    imagen_url: prod.imagen_url || '',
    disponible: prod.disponible
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function handleSaveProduct() {
  if (!form.value.nombre.trim()) return

  if (isEditing.value && currentEditId.value) {
    updateProduct(currentEditId.value, {
      nombre: form.value.nombre.trim(),
      categoria_id: form.value.categoria_id,
      precio: Number(form.value.precio),
      descripcion: form.value.descripcion.trim() || null,
      mostrar_descripcion: form.value.mostrar_descripcion,
      imagen_url: form.value.imagen_url.trim() || null,
      disponible: form.value.disponible
    })
  } else {
    addProduct({
      nombre: form.value.nombre.trim(),
      categoria_id: form.value.categoria_id,
      precio: Number(form.value.precio),
      descripcion: form.value.descripcion.trim() || null,
      mostrar_descripcion: form.value.mostrar_descripcion,
      imagen_url: form.value.imagen_url.trim() || null,
      disponible: form.value.disponible
    })
  }

  closeModal()
}

function confirmDelete(prod: Producto) {
  if (confirm(`¿Estás seguro de eliminar "${prod.nombre}" de la carta?`)) {
    deleteProduct(prod.id)
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Gestión de Productos</h2>
        <p class="text-xs text-slate-500">
          Total: {{ products.length }} platos y bebidas registrados.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl flex items-center gap-1.5 shadow-xs"
      >
        <PlusIcon class="w-4 h-4" />
        <span>Crear Producto</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
      <!-- Search -->
      <div class="relative flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar producto por nombre..."
          class="input input-sm w-full pl-9 bg-white border-slate-200 text-xs rounded-xl focus:border-brand-primary focus:outline-none"
        />
        <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          @click="filterCategoryId = 'all'"
          class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap"
          :class="filterCategoryId === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
        >
          Todas ({{ products.length }})
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          @click="filterCategoryId = cat.id"
          class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap"
          :class="filterCategoryId === cat.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
        >
          {{ cat.nombre }}
        </button>
      </div>
    </div>

    <!-- Product List / Table -->
    <div class="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
      <div v-if="filteredProducts.length === 0" class="p-8 text-center text-slate-400 text-xs">
        No se encontraron productos con los filtros seleccionados.
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div
          v-for="prod in filteredProducts"
          :key="prod.id"
          class="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
        >
          <!-- Product Info with Thumbnail -->
          <div class="flex items-center gap-3 min-w-0">
            <!-- Thumbnail -->
            <div class="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/70 overflow-hidden shrink-0 flex items-center justify-center">
              <img
                v-if="prod.imagen_url"
                :src="prod.imagen_url"
                :alt="prod.nombre"
                class="w-full h-full object-cover"
              />
              <CakeIcon v-else class="w-5 h-5 text-brand-primary/80" />
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="font-semibold text-slate-900 text-sm truncate">
                  {{ prod.nombre }}
                </h4>
                <span class="badge badge-xs bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
                  {{ getCategoryName(prod.categoria_id) }}
                </span>
                <span
                  v-if="prod.descripcion"
                  class="badge badge-xs text-[9px] font-mono border"
                  :class="prod.mostrar_descripcion ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'"
                  :title="prod.mostrar_descripcion ? 'Descripción visible en la carta' : 'Descripción oculta en la carta'"
                >
                  {{ prod.mostrar_descripcion ? 'Desc. visible' : 'Desc. oculta' }}
                </span>
              </div>
              <p v-if="prod.descripcion" class="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                {{ prod.descripcion }}
              </p>
              <div class="text-brand-primary font-bold text-sm mt-0.5">
                S/ {{ Number(prod.precio).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Actions: Availability Toggle, Edit, Delete -->
          <div class="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-none border-slate-100">
            <!-- Availability toggle -->
            <button
              type="button"
              @click="toggleProductAvailability(prod.id)"
              class="badge text-xs font-semibold py-2.5 px-3 border cursor-pointer transition-colors"
              :class="prod.disponible ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'"
              :title="prod.disponible ? 'Clic para marcar como Agotado' : 'Clic para marcar como Disponible'"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="prod.disponible ? 'bg-emerald-500' : 'bg-red-500'"></span>
              {{ prod.disponible ? 'Disponible' : 'Agotado' }}
            </button>

            <!-- Edit Button -->
            <button
              type="button"
              @click="openEditModal(prod)"
              class="btn btn-xs btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-lg px-2.5 flex items-center gap-1"
            >
              <PencilSquareIcon class="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <!-- Delete Button -->
            <button
              type="button"
              @click="confirmDelete(prod)"
              class="btn btn-xs btn-ghost text-red-500 hover:bg-red-50 rounded-lg px-2"
              title="Eliminar plato"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal Dialog -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 class="font-bold text-slate-900 text-base">
            {{ isEditing ? 'Editar Producto' : 'Crear Nuevo Producto' }}
          </h3>
          <button type="button" @click="closeModal" class="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSaveProduct" class="space-y-3.5 text-xs">
          <!-- Nombre -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nombre del Plato o Bebida *</label>
            <input
              v-model="form.nombre"
              type="text"
              required
              placeholder="Ej: Lomo Saltado Criollo"
              class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
            />
          </div>

          <!-- Carta / Categoría & Precio -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Carta Asignada</label>
              <select
                v-model="form.categoria_id"
                class="select select-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Precio (PEN S/) *</label>
              <input
                v-model="form.precio"
                type="number"
                step="0.50"
                min="0"
                required
                class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
              />
            </div>
          </div>

          <!-- Descripción & Mostrar en Carta pública -->
          <div class="space-y-1.5">
            <label class="block font-semibold text-slate-700">Descripción del Producto</label>
            <textarea
              v-model="form.descripcion"
              rows="2"
              placeholder="Escribe la descripción, ingredientes o detalles del plato..."
              class="textarea textarea-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary leading-relaxed"
            ></textarea>

            <div class="flex items-center gap-2 pt-0.5">
              <input
                id="show-desc-check"
                v-model="form.mostrar_descripcion"
                type="checkbox"
                class="checkbox checkbox-xs checkbox-primary rounded"
              />
              <label for="show-desc-check" class="text-xs font-medium text-slate-600 select-none cursor-pointer">
                Mostrar descripción en la carta digital
              </label>
            </div>
          </div>

          <!-- URL de Imagen -->
          <div>
            <label class="block font-semibold text-slate-700 mb-1">URL de Imagen (Opcional)</label>
            <input
              v-model="form.imagen_url"
              type="url"
              placeholder="https://images.unsplash.com/..."
              class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
            />
            <div v-if="form.imagen_url" class="mt-2 flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <img :src="form.imagen_url" alt="Preview" class="w-10 h-10 object-cover rounded-md" />
              <span class="text-[10px] text-slate-500">Vista previa de imagen</span>
            </div>
          </div>

          <!-- Disponibilidad Checkbox -->
          <div class="pt-1 flex items-center gap-2">
            <input
              id="disp-check"
              v-model="form.disponible"
              type="checkbox"
              class="checkbox checkbox-sm checkbox-primary rounded"
            />
            <label for="disp-check" class="font-medium text-slate-700 select-none cursor-pointer">
              Disponible para comensales en la carta
            </label>
          </div>

          <!-- Modal Buttons -->
          <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              @click="closeModal"
              class="btn btn-sm btn-ghost text-slate-600 rounded-xl text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs"
            >
              {{ isEditing ? 'Guardar Cambios' : 'Crear Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
