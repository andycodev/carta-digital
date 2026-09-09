import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Categoria } from '@/types/database'

export function useMenuSchedule(categoriesRef: { value: Categoria[] }) {
  const currentTime = ref<string>(getCurrentTimeString())
  const selectedCategoryId = ref<string | null>(null)
  let timer: number | null = null

  function getCurrentTimeString(): string {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  function isCategoryInCurrentShift(cat: Categoria, timeStr = currentTime.value): boolean {
    if (cat.siempre_disponible) {
      // Check if within hours even if always available
      if (cat.hora_inicio && cat.hora_fin) {
        if (cat.hora_inicio <= cat.hora_fin) {
          return timeStr >= cat.hora_inicio && timeStr <= cat.hora_fin
        } else {
          // Crosses midnight
          return timeStr >= cat.hora_inicio || timeStr <= cat.hora_fin
        }
      }
      return true
    }

    if (!cat.hora_inicio || !cat.hora_fin) return false

    if (cat.hora_inicio <= cat.hora_fin) {
      return timeStr >= cat.hora_inicio && timeStr <= cat.hora_fin
    } else {
      // Shift spans midnight (e.g. 20:00 to 03:00)
      return timeStr >= cat.hora_inicio || timeStr <= cat.hora_fin
    }
  }

  function isCategoryVisible(cat: Categoria, timeStr = currentTime.value): boolean {
    if (cat.siempre_disponible) return true
    return isCategoryInCurrentShift(cat, timeStr)
  }

  // Categories filtered according to schedule and always_available flag
  const visibleCategories = computed<Categoria[]>(() => {
    return categoriesRef.value
      .filter(cat => cat.activo && isCategoryVisible(cat))
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  })

  // Find the category currently in active shift (not necessarily bar)
  const currentShiftCategory = computed<Categoria | null>(() => {
    // Prioritize time-bound shift first, then always-available
    const timeBoundActive = categoriesRef.value.find(
      cat => cat.activo && !cat.siempre_disponible && isCategoryInCurrentShift(cat)
    )
    if (timeBoundActive) return timeBoundActive

    return categoriesRef.value.find(
      cat => cat.activo && isCategoryInCurrentShift(cat)
    ) || null
  })

  // Auto-select tab logic
  function autoSelectCategory() {
    const list = visibleCategories.value
    if (list.length === 0) {
      selectedCategoryId.value = null
      return
    }

    // 1. If currently selected category is still visible, keep it
    if (selectedCategoryId.value && list.some(c => c.id === selectedCategoryId.value)) {
      return
    }

    // 2. Try to auto-select current active shift
    if (currentShiftCategory.value && list.some(c => c.id === currentShiftCategory.value?.id)) {
      selectedCategoryId.value = currentShiftCategory.value.id
      return
    }

    // 3. Fallback to first available category
    selectedCategoryId.value = list[0].id
  }

  function selectCategory(id: string) {
    selectedCategoryId.value = id
  }

  function formatTimeRange(inicio: string, fin: string): string {
    const formatH = (t: string) => {
      if (!t) return ''
      const parts = t.split(':')
      return `${parts[0]}:${parts[1]}`
    }
    return `${formatH(inicio)} - ${formatH(fin)}`
  }

  onMounted(() => {
    timer = window.setInterval(() => {
      currentTime.value = getCurrentTimeString()
    }, 1000)
    autoSelectCategory()
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    currentTime,
    selectedCategoryId,
    visibleCategories,
    currentShiftCategory,
    isCategoryInCurrentShift,
    isCategoryVisible,
    autoSelectCategory,
    selectCategory,
    formatTimeRange
  }
}
