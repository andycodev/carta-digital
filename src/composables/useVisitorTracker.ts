import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import type { MenuVisit } from '@/types/database'

const STORAGE_KEY_VISITOR_ID = 'delicias_visitor_id_v1'
const STORAGE_KEY_VISITS = 'delicias_menu_visits_v1'
const VISIT_COOLDOWN_MS = 3 * 60 * 60 * 1000 // 3 hours cooldown to prevent artificial inflation

// Demo initial visits for realistic representation of public menu traffic
function generateInitialDemoVisits(): MenuVisit[] {
  const now = Date.now()
  const oneHour = 3600000
  const oneDay = 86400000

  return [
    // Today
    { id: 'v-1', menu_type: 'main', visitor_id: 'vis-101', source: 'qr', visited_at: new Date(now - oneHour * 1).toISOString() },
    { id: 'v-2', menu_type: 'main', visitor_id: 'vis-102', source: 'direct', visited_at: new Date(now - oneHour * 2).toISOString() },
    { id: 'v-3', menu_type: 'bar', visitor_id: 'vis-103', source: 'qr', visited_at: new Date(now - oneHour * 1.5).toISOString() },
    { id: 'v-4', menu_type: 'main', visitor_id: 'vis-104', source: 'whatsapp', visited_at: new Date(now - oneHour * 3).toISOString() },
    { id: 'v-5', menu_type: 'bar', visitor_id: 'vis-105', source: 'direct', visited_at: new Date(now - oneHour * 0.5).toISOString() },
    // Yesterday
    { id: 'v-6', menu_type: 'main', visitor_id: 'vis-201', source: 'qr', visited_at: new Date(now - oneDay * 1).toISOString() },
    { id: 'v-7', menu_type: 'main', visitor_id: 'vis-202', source: 'qr', visited_at: new Date(now - oneDay * 1 - oneHour * 3).toISOString() },
    { id: 'v-8', menu_type: 'bar', visitor_id: 'vis-203', source: 'direct', visited_at: new Date(now - oneDay * 1).toISOString() },
    // Last 7 days
    { id: 'v-9', menu_type: 'main', visitor_id: 'vis-301', source: 'qr', visited_at: new Date(now - oneDay * 3).toISOString() },
    { id: 'v-10', menu_type: 'main', visitor_id: 'vis-302', source: 'direct', visited_at: new Date(now - oneDay * 4).toISOString() },
    { id: 'v-11', menu_type: 'bar', visitor_id: 'vis-303', source: 'qr', visited_at: new Date(now - oneDay * 4).toISOString() },
    { id: 'v-12', menu_type: 'main', visitor_id: 'vis-304', source: 'instagram', visited_at: new Date(now - oneDay * 5).toISOString() },
    { id: 'v-13', menu_type: 'bar', visitor_id: 'vis-305', source: 'qr', visited_at: new Date(now - oneDay * 6).toISOString() },
    // Last 30 days
    { id: 'v-14', menu_type: 'main', visitor_id: 'vis-401', source: 'qr', visited_at: new Date(now - oneDay * 12).toISOString() },
    { id: 'v-15', menu_type: 'bar', visitor_id: 'vis-402', source: 'direct', visited_at: new Date(now - oneDay * 18).toISOString() },
    { id: 'v-16', menu_type: 'main', visitor_id: 'vis-403', source: 'qr', visited_at: new Date(now - oneDay * 22).toISOString() },
    { id: 'v-17', menu_type: 'main', visitor_id: 'vis-404', source: 'direct', visited_at: new Date(now - oneDay * 25).toISOString() }
  ]
}

function loadStoredVisits(): MenuVisit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISITS)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Error reading visits storage:', e)
  }
  return generateInitialDemoVisits()
}

const allVisits = ref<MenuVisit[]>(loadStoredVisits())

export function useVisitorTracker() {
  // Get or generate persistent anonymous visitor ID
  function getVisitorId(): string {
    let vid = localStorage.getItem(STORAGE_KEY_VISITOR_ID)
    if (!vid) {
      vid = 'vis-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      try {
        localStorage.setItem(STORAGE_KEY_VISITOR_ID, vid)
      } catch (e) {
        console.warn('Could not save visitor ID:', e)
      }
    }
    return vid
  }

  // Track visit to a public menu with anti-inflation cooldown window
  async function trackVisit(
    menuType: 'main' | 'bar',
    queryParams?: Record<string, string | (string | null)[] | null | undefined>
  ) {
    const now = Date.now()
    const lastVisitKey = `delicias_last_visit_${menuType}`
    const lastVisit = localStorage.getItem(lastVisitKey)

    // Cooldown check (3 hours) to prevent artificial inflating on page reload
    if (lastVisit) {
      const elapsed = now - parseInt(lastVisit, 10)
      if (elapsed < VISIT_COOLDOWN_MS) {
        return
      }
    }

    localStorage.setItem(lastVisitKey, now.toString())
    const visitorId = getVisitorId()

    // Determine traffic source
    let source = 'direct'

    if (queryParams && queryParams.source) {
      source = String(queryParams.source)
    }

    const newVisit: MenuVisit = {
      id: crypto.randomUUID ? crypto.randomUUID() : `v-${now}`,
      menu_type: menuType,
      visitor_id: visitorId,
      source,
      visited_at: new Date().toISOString()
    }

    allVisits.value.unshift(newVisit)
    try {
      localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(allVisits.value))
    } catch (e) {
      console.warn('Could not persist visit locally:', e)
    }

    // If Supabase connected, insert
    if (isSupabaseConfigured) {
      try {
        await supabase.from('menu_visits').insert([{
          menu_type: newVisit.menu_type,
          visitor_id: newVisit.visitor_id,
          source: newVisit.source
        }])
      } catch (err) {
        console.warn('Supabase menu_visits insert note:', err)
      }
    }
  }

  // Metric calculation helpers
  function calculateMetricsForType(type: 'main' | 'bar') {
    const list = allVisits.value.filter(v => v.menu_type === type)
    const now = new Date()

    // Today start (00:00:00 local time)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const sevenDaysAgo = now.getTime() - (7 * 86400000)
    const thirtyDaysAgo = now.getTime() - (30 * 86400000)

    const total = list.length
    let today = 0
    let last7Days = 0
    let last30Days = 0

    const sourceBreakdown: Record<string, number> = {
      qr: 0,
      direct: 0,
      whatsapp: 0,
      social: 0
    }

    for (const v of list) {
      const t = new Date(v.visited_at).getTime()
      if (t >= todayStart) today++
      if (t >= sevenDaysAgo) last7Days++
      if (t >= thirtyDaysAgo) last30Days++

      const s = (v.source || 'direct').toLowerCase()
      if (s.includes('qr')) sourceBreakdown.qr++
      else if (s.includes('whats')) sourceBreakdown.whatsapp++
      else if (s.includes('insta') || s.includes('face') || s.includes('social')) sourceBreakdown.social++
      else sourceBreakdown.direct++
    }

    return {
      total,
      today,
      last7Days,
      last30Days,
      sources: sourceBreakdown,
      sourceBreakdown
    }
  }

  const mainMetrics = computed(() => calculateMetricsForType('main'))
  const barMetrics = computed(() => calculateMetricsForType('bar'))

  const qrMetrics = computed(() => {
    const qrVisits = allVisits.value.filter(v => (v.source || '').toLowerCase().includes('qr'))
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    let todayScans = 0
    let scansRestaurant = 0
    let scansBar = 0

    for (const v of qrVisits) {
      if (new Date(v.visited_at).getTime() >= todayStart) todayScans++
      if (v.menu_type === 'bar') {
        scansBar++
      } else {
        scansRestaurant++
      }
    }

    const directVisits = allVisits.value.filter(v => (v.source || '').toLowerCase().includes('direct')).length
    const socialVisits = allVisits.value.filter(v => {
      const s = (v.source || '').toLowerCase()
      return s.includes('whats') || s.includes('insta') || s.includes('face') || s.includes('social')
    }).length

    return {
      totalScans: qrVisits.length,
      todayScans,
      scansRestaurant,
      scansBar,
      directVisits,
      socialVisits
    }
  })

  return {
    allVisits,
    mainMetrics,
    restaurantMetrics: mainMetrics,
    barMetrics,
    qrMetrics,
    trackVisit,
    getVisitorId
  }
}
