import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import type {
  Categoria,
  Producto,
  AppConfig,
  WhatsAppSubscriber,
  WhatsAppSubscriptionStatus
} from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

const STORAGE_KEY_CATEGORIES = 'delicias_categories_v2'
const STORAGE_KEY_PRODUCTS = 'delicias_products_v2'
const STORAGE_KEY_CONFIG = 'delicias_config_v6'
const STORAGE_KEY_WHATSAPP_SUBS = 'delicias_whatsapp_subs_v1'
const STORAGE_KEY_CONFIG_TS = 'delicias_config_ts_v6'  // timestamp del último fetch

const DEFAULT_WHATSAPP_SUBS: WhatsAppSubscriber[] = [
  {
    id: 'sub-1',
    name: 'Carlos Mendoza',
    phone: '987654321',
    source_menu: 'main',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'sub-2',
    name: 'Valeria Ramos',
    phone: '976543210',
    source_menu: 'bar',
    status: 'joined',
    created_at: new Date(Date.now() - 3600000 * 26).toISOString()
  },
  {
    id: 'sub-3',
    name: 'Luis Fernando Díaz',
    phone: '991234567',
    source_menu: 'main',
    status: 'contacted',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
]

const DEFAULT_CATEGORIES: Categoria[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Desayunos',
    hora_inicio: '07:00:00',
    hora_fin: '11:59:59',
    siempre_disponible: false,
    activo: true,
    orden: 1
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Almuerzos',
    hora_inicio: '12:00:00',
    hora_fin: '17:59:59',
    siempre_disponible: false,
    activo: true,
    orden: 2
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Cenas',
    hora_inicio: '18:00:00',
    hora_fin: '23:59:59',
    siempre_disponible: false,
    activo: true,
    orden: 3
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Bar & Coctelería',
    hora_inicio: '00:00:00',
    hora_fin: '23:59:59',
    siempre_disponible: true,
    activo: true,
    orden: 4
  }
]

const DEFAULT_PRODUCTS: Producto[] = [
  // Desayunos
  {
    id: 'p-1',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Tostada Francesa Artesanal',
    descripcion: 'Brioche caramelizado con frutos rojos silvestres, crema chantilly y miel pura.',
    precio: 16.00,
    imagen_url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-2',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Huevos Benedictinos Trufados',
    descripcion: 'Huevos pochados, jamón crujiente y salsa holandesa trufada.',
    precio: 18.50,
    imagen_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-3',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Bowl de Açaí Amazónico',
    descripcion: 'Açaí natural batido con granola casera y frutas frescas.',
    precio: 14.00,
    imagen_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-4',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Café de Especialidad Geisha',
    descripcion: 'Café de altura filtrado en método V60.',
    precio: 8.50,
    imagen_url: null,
    disponible: true
  },

  // Almuerzos
  {
    id: 'p-5',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Ceviche Clásico Las Delicias',
    descripcion: 'Pesca fresca en leche de tigre al ají limo, camote glaseado y choclo tierno.',
    precio: 34.00,
    imagen_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-6',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Lomo Saltado al Wok Gourmet',
    descripcion: 'Lomo fino flameado con cebollas crujientes, tomates, papas doradas y arroz con choclo.',
    precio: 38.00,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-7',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Arroz con Mariscos a la Brasa',
    descripcion: 'Arroz criollo sazonado con ají amarillo, langostinos, calamar y conchas de abanico.',
    precio: 36.00,
    imagen_url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-8',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Causa Limeña de Cangrejo',
    descripcion: 'Papa amarilla prensada con ají amarillo, pulpa de cangrejo y palta fuerte.',
    precio: 26.00,
    imagen_url: null,
    disponible: true
  },

  // Cenas
  {
    id: 'p-9',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Salmón Glaseado al Maracuyá',
    descripcion: 'Filete de salmón a la plancha con salsa agridulce de maracuyá y risotto de quinua.',
    precio: 42.00,
    imagen_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-10',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Costillar Braseado al BBQ Andino',
    descripcion: 'Costillas cocidas a fuego lento por 12 horas con puré de camote rústico.',
    precio: 39.00,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-11',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Carpaccio de Res con Parmesano',
    descripcion: 'Finas láminas de lomo con alcaparras, aceite de oliva virgen y queso curado.',
    precio: 28.00,
    imagen_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },

  // Bar & Coctelería
  {
    id: 'p-12',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Pisco Sour Catedral Quebranta',
    descripcion: 'Pisco peruano premium, zumo de limón sutil, jarabe de goma y amargo de angostura.',
    precio: 22.00,
    imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-13',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Chilcano Clásico de Maracuyá',
    descripcion: 'Pisco acholado, zumo fresco de maracuyá, ginger ale y gotas de bitter.',
    precio: 20.00,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-14',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Gin Tonic Botánico con Romero',
    descripcion: 'Gin artesanal, agua tónica premium y romero silvestre flameado.',
    precio: 25.00,
    imagen_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-15',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Espresso Martini de la Casa',
    descripcion: 'Vodka, licor de café artesanal y shot de espresso fresco.',
    precio: 24.00,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    disponible: true
  }
]

const DEFAULT_CONFIG: AppConfig = {
  nombre_negocio: 'Las Delicias Restobar',
  subtitulo: 'Sabor, música y buenos momentos',
  musica_activa: true,
  musica_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  musica_volumen: 35,
  telefono_whatsapp: '945589531',
  whatsapp_group_url: 'https://chat.whatsapp.com/GHccRb7vBQL0gMMbybfU5i?s=cl&p=a&mlu=4&ilr=4',
  whatsapp_subscription_enabled: true,
  mostrar_precios_carta: true,
  mostrar_precios_flyers: true,
  bar_video_url: '/videos/bar-promo.mp4',
  bar_music_url: ''
}

// Global Singletons for cross-view reactivity
function loadInitial<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e)
  }
  return fallback
}

const categories = ref<Categoria[]>(loadInitial(STORAGE_KEY_CATEGORIES, DEFAULT_CATEGORIES))
const products = ref<Producto[]>(loadInitial(STORAGE_KEY_PRODUCTS, DEFAULT_PRODUCTS))
const config = ref<AppConfig>(loadInitial(STORAGE_KEY_CONFIG, DEFAULT_CONFIG))
const whatsappSubscriptions = ref<WhatsAppSubscriber[]>(loadInitial(STORAGE_KEY_WHATSAPP_SUBS, DEFAULT_WHATSAPP_SUBS))
const isRealtimeMenuConnected = ref<boolean>(false)

// ─────────────────────────────────────────────────────────────────────────────
// Sync de restaurant_settings desde Supabase
// Estrategia:
//  1. Siempre fetch fresco al iniciar (DB = fuente de verdad, ignora cache).
//  2. Realtime escucha cambios y aplica en tiempo real.
//  3. Polling de respaldo cada 5 min (para mobile donde el WS puede caer).
//  4. La DB sobreescribe el localStorage — no al revés.
// ─────────────────────────────────────────────────────────────────────────────

/** Mapea la fila de Supabase a AppConfig, usando DB como fuente de verdad. */
function rowToConfig(row: Record<string, unknown>, base: typeof config.value): typeof config.value {
  return {
    nombre_negocio: (row.nombre_negocio as string ?? base.nombre_negocio),
    subtitulo: (row.subtitulo as string ?? base.subtitulo),
    telefono_whatsapp: (row.telefono_whatsapp as string ?? base.telefono_whatsapp),
    whatsapp_group_url: (row.whatsapp_group_url as string ?? base.whatsapp_group_url),
    whatsapp_subscription_enabled: (row.whatsapp_subscription_enabled as boolean ?? base.whatsapp_subscription_enabled),
    mostrar_precios_carta: (row.mostrar_precios_carta as boolean ?? base.mostrar_precios_carta),
    mostrar_precios_flyers: (row.mostrar_precios_flyers as boolean ?? base.mostrar_precios_flyers),
    musica_activa: (row.musica_activa as boolean ?? base.musica_activa),
    musica_url: (row.musica_url as string ?? base.musica_url),
    musica_volumen: (row.musica_volumen as number ?? base.musica_volumen),
    bar_video_url: (row.bar_video_url as string ?? base.bar_video_url),
    bar_music_url: (row.bar_music_url as string ?? base.bar_music_url),
  }
}

async function syncConfigWithSupabase() {
  if (!isSupabaseConfigured) return
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()

    if (error) {
      console.warn('[Config] Supabase restaurant_settings error:', error.message)
      return
    }

    if (data) {
      // DB siempre gana — sobreescribimos config completo
      config.value = rowToConfig(data as Record<string, unknown>, DEFAULT_CONFIG)
      persist(STORAGE_KEY_CONFIG, config.value)
      try { localStorage.setItem(STORAGE_KEY_CONFIG_TS, String(Date.now())) } catch (_) { /* noop */ }
      console.log('[Config] Synced from Supabase ✓')
    }
  } catch (e) {
    console.warn('[Config] Sync exception:', e)
  }
}

// Llamada inicial — siempre al cargar la app
syncConfigWithSupabase()

// Realtime con reconexión automática
if (isSupabaseConfigured) {
  let realtimeChannel = supabase
    .channel('restaurant_settings_rt')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'restaurant_settings' },
      (payload) => {
        const row = payload.new as Record<string, unknown>
        if (row && Object.keys(row).length > 0) {
          config.value = rowToConfig(row, config.value)
          persist(STORAGE_KEY_CONFIG, config.value)
          console.log('[Config] Realtime update applied ✓')
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Config] Realtime connected ✓')
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.warn('[Config] Realtime lost. Reconnecting...', err?.message)
        // Reconexión manual con back-off suave
        setTimeout(() => {
          try { supabase.removeChannel(realtimeChannel) } catch (_) { /* noop */ }
          realtimeChannel = supabase
            .channel('restaurant_settings_rt_retry')
            .on('postgres_changes',
              { event: '*', schema: 'public', table: 'restaurant_settings' },
              (payload) => {
                const row = payload.new as Record<string, unknown>
                if (row && Object.keys(row).length > 0) {
                  config.value = rowToConfig(row, config.value)
                  persist(STORAGE_KEY_CONFIG, config.value)
                  console.log('[Config] Realtime (retry) update applied ✓')
                }
              }
            )
            .subscribe()
        }, 5000)
      }
    })

  // Polling de respaldo cada 5 minutos — cubre dispositivos móviles
  // donde el WebSocket puede caer silenciosamente en background.
  setInterval(() => {
    syncConfigWithSupabase()
  }, 5 * 60 * 1000)

  // Refresco inmediato al volver al tab/app desde background (iOS/Android)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncConfigWithSupabase()
      }
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Realtime para Productos y Categorías
// Estrategia idéntica a restaurant_settings:
//  1. Fetch inicial desde Supabase (DB = fuente de verdad).
//  2. Realtime escucha INSERT/UPDATE/DELETE y muta los refs globales.
//  3. Polling de respaldo cada 5 min para mobile/WebSocket caído.
// ─────────────────────────────────────────────────────────────────────────────

async function syncMenuWithSupabase() {
  if (!isSupabaseConfigured) return
  try {
    const [{ data: catData, error: catErr }, { data: prodData, error: prodErr }] = await Promise.all([
      supabase.from('categorias').select('*').eq('activo', true).order('orden', { ascending: true }),
      supabase.from('productos').select('*').order('nombre', { ascending: true })
    ])

    if (catErr) console.warn('[Menu] Error fetching categorias:', catErr.message)
    else if (catData) {
      categories.value = catData
      persist(STORAGE_KEY_CATEGORIES, catData)
    }

    if (prodErr) console.warn('[Menu] Error fetching productos:', prodErr.message)
    else if (prodData) {
      products.value = prodData.map((p: Producto) => ({ ...p, precio: Number(p.precio) }))
      persist(STORAGE_KEY_PRODUCTS, products.value)
    }

    console.log('[Menu] Synced from Supabase ✓')
  } catch (e) {
    console.warn('[Menu] Sync exception:', e)
  }
}

// Carga inicial
syncMenuWithSupabase()

if (isSupabaseConfigured) {
  let menuChannel: RealtimeChannel = supabase
    .channel('menu_store_rt')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'productos' },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload
        console.log('[Menu] Realtime productos:', eventType)

        if (eventType === 'INSERT') {
          const inserted = { ...(newRecord as Producto), precio: Number((newRecord as Producto).precio) }
          const idx = products.value.findIndex(p => p.id === inserted.id)
          if (idx >= 0) {
            products.value[idx] = inserted
          } else {
            products.value.push(inserted)
          }
        } else if (eventType === 'UPDATE') {
          const updated = { ...(newRecord as Producto), precio: Number((newRecord as Producto).precio) }
          const idx = products.value.findIndex(p => p.id === updated.id)
          if (idx !== -1) {
            products.value[idx] = updated
          } else {
            // Producto que fue creado offline y ahora llega por realtime
            products.value.push(updated)
          }
        } else if (eventType === 'DELETE') {
          const deletedId = (oldRecord as { id: string })?.id
          if (deletedId) {
            products.value = products.value.filter(p => p.id !== deletedId)
          }
        }

        persist(STORAGE_KEY_PRODUCTS, products.value)
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categorias' },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload
        console.log('[Menu] Realtime categorias:', eventType)

        if (eventType === 'INSERT') {
          const cat = newRecord as Categoria
          if (cat.activo && !categories.value.some(c => c.id === cat.id)) {
            categories.value.push(cat)
            categories.value.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          }
        } else if (eventType === 'UPDATE') {
          const cat = newRecord as Categoria
          const idx = categories.value.findIndex(c => c.id === cat.id)
          if (!cat.activo) {
            if (idx !== -1) categories.value.splice(idx, 1)
          } else {
            if (idx !== -1) {
              categories.value[idx] = cat
            } else {
              categories.value.push(cat)
            }
            categories.value.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
          }
        } else if (eventType === 'DELETE') {
          const deletedId = (oldRecord as { id: string })?.id
          if (deletedId) {
            categories.value = categories.value.filter(c => c.id !== deletedId)
            // Limpia también productos huérfanos
            products.value = products.value.filter(p => p.categoria_id !== deletedId)
          }
        }

        persist(STORAGE_KEY_CATEGORIES, categories.value)
        persist(STORAGE_KEY_PRODUCTS, products.value)
      }
    )
    .subscribe((status, err) => {
      isRealtimeMenuConnected.value = status === 'SUBSCRIBED'
      if (status === 'SUBSCRIBED') {
        console.log('[Menu] Realtime conectado ✓')
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.warn('[Menu] Realtime perdido. Reconectando...', err?.message)
        setTimeout(() => {
          try { supabase.removeChannel(menuChannel) } catch (_) { /* noop */ }
          menuChannel = supabase
            .channel('menu_store_rt_retry')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => syncMenuWithSupabase())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => syncMenuWithSupabase())
            .subscribe((s) => { isRealtimeMenuConnected.value = s === 'SUBSCRIBED' })
        }, 5000)
      }
    })

  // Polling de respaldo cada 5 min
  setInterval(() => syncMenuWithSupabase(), 5 * 60 * 1000)

  // Re-sync al volver al tab desde background (iOS/Android)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncMenuWithSupabase()
    })
  }
}

// Automatically update old slogan or clear example group links in local cache
let configChanged = false
if (config.value.subtitulo === 'Gastronomía & Coctelería de Autor') {
  config.value.subtitulo = 'Sabor, música y buenos momentos'
  configChanged = true
}
if (config.value.whatsapp_group_url && config.value.whatsapp_group_url.includes('EXAMPLE')) {
  config.value.whatsapp_group_url = 'https://chat.whatsapp.com/GHccRb7vBQL0gMMbybfU5i?s=cl&p=a&mlu=4&ilr=4'
  configChanged = true
}
if (!config.value.whatsapp_group_url) {
  config.value.whatsapp_group_url = 'https://chat.whatsapp.com/GHccRb7vBQL0gMMbybfU5i?s=cl&p=a&mlu=4&ilr=4'
  configChanged = true
}
if (config.value.telefono_whatsapp !== '945589531' && config.value.telefono_whatsapp === '+51 987 654 321') {
  config.value.telefono_whatsapp = '945589531'
  configChanged = true
}
if (configChanged) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config.value))
  } catch (e) {
    console.error('Error saving updated config:', e)
  }
}

// Auto-persist helper
function persist(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e)
  }
}

export function useMenuStore() {
  // --- PRODUCT ACTIONS ---
  function addProduct(productData: Omit<Producto, 'id'>) {
    const newProd: Producto = {
      ...productData,
      id: `p-${Date.now()}`
    }
    products.value.unshift(newProd)
    persist(STORAGE_KEY_PRODUCTS, products.value)

    if (isSupabaseConfigured) {
      supabase.from('productos').insert(newProd).then(({ error }) => {
        if (error) console.error('Error inserting to Supabase:', error)
      })
    }
    return newProd
  }

  function updateProduct(id: string, updates: Partial<Producto>) {
    const idx = products.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      products.value[idx] = { ...products.value[idx], ...updates }
      persist(STORAGE_KEY_PRODUCTS, products.value)

      if (isSupabaseConfigured) {
        supabase.from('productos').update(updates).eq('id', id).then(({ error }) => {
          if (error) console.error('Error updating Supabase:', error)
        })
      }
    }
  }

  function deleteProduct(id: string) {
    products.value = products.value.filter(p => p.id !== id)
    persist(STORAGE_KEY_PRODUCTS, products.value)

    if (isSupabaseConfigured) {
      supabase.from('productos').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting from Supabase:', error)
      })
    }
  }

  function toggleProductAvailability(id: string) {
    const prod = products.value.find(p => p.id === id)
    if (prod) {
      prod.disponible = !prod.disponible
      persist(STORAGE_KEY_PRODUCTS, products.value)

      if (isSupabaseConfigured) {
        supabase.from('productos').update({ disponible: prod.disponible }).eq('id', id).then(({ error }) => {
          if (error) console.error('Error toggling in Supabase:', error)
        })
      }
    }
  }

  // --- CATEGORY / CARTA ACTIONS ---
  function updateCategory(id: string, updates: Partial<Categoria>) {
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) {
      categories.value[idx] = { ...categories.value[idx], ...updates }
      persist(STORAGE_KEY_CATEGORIES, categories.value)

      if (isSupabaseConfigured) {
        supabase.from('categorias').update(updates).eq('id', id).then(({ error }) => {
          if (error) console.error('Error updating category in Supabase:', error)
        })
      }
    }
  }

  function toggleCategoryActive(id: string) {
    const cat = categories.value.find(c => c.id === id)
    if (cat) {
      cat.activo = !cat.activo
      persist(STORAGE_KEY_CATEGORIES, categories.value)
    }
  }

  // --- CONFIG ACTIONS ---
  function updateConfig(updates: Partial<AppConfig>) {
    config.value = { ...config.value, ...updates }
    persist(STORAGE_KEY_CONFIG, config.value)

    if (isSupabaseConfigured) {
      supabase
        .from('restaurant_settings')
        .upsert({
          id: 'default',
          nombre_negocio: config.value.nombre_negocio,
          subtitulo: config.value.subtitulo,
          telefono_whatsapp: config.value.telefono_whatsapp,
          whatsapp_group_url: config.value.whatsapp_group_url,
          whatsapp_subscription_enabled: config.value.whatsapp_subscription_enabled,
          mostrar_precios_carta: config.value.mostrar_precios_carta,
          mostrar_precios_flyers: config.value.mostrar_precios_flyers,
          musica_activa: config.value.musica_activa,
          musica_url: config.value.musica_url,
          musica_volumen: config.value.musica_volumen,
          bar_video_url: config.value.bar_video_url,
          bar_music_url: config.value.bar_music_url,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.error('Error saving restaurant_settings to Supabase:', error)
        })
    }
  }

  // Restore factory defaults
  function restoreDefaults() {
    categories.value = [...DEFAULT_CATEGORIES]
    products.value = [...DEFAULT_PRODUCTS]
    config.value = { ...DEFAULT_CONFIG }
    persist(STORAGE_KEY_CATEGORIES, categories.value)
    persist(STORAGE_KEY_PRODUCTS, products.value)
    persist(STORAGE_KEY_CONFIG, config.value)
    persist(STORAGE_KEY_WHATSAPP_SUBS, whatsappSubscriptions.value)
  }

  // --- WHATSAPP SUBSCRIPTIONS ACTIONS ---
  async function subscribeToWhatsApp(payload: {
    name?: string
    phone: string
    source_menu?: 'main' | 'bar'
  }) {
    const cleanPhone = payload.phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 8) {
      throw new Error('Por favor ingresa un número de celular válido de 9 dígitos.')
    }

    const groupUrl = config.value.whatsapp_group_url || ''

    // Check if phone already registered (prevent duplicates)
    const existing = whatsappSubscriptions.value.find(s => s.phone.replace(/\D/g, '') === cleanPhone)
    if (existing) {
      return {
        success: true,
        alreadyRegistered: true,
        subscriber: existing,
        groupUrl
      }
    }

    const newSub: WhatsAppSubscriber = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`,
      name: payload.name?.trim() || null,
      phone: cleanPhone,
      source_menu: payload.source_menu || 'main',
      status: 'pending',
      created_at: new Date().toISOString()
    }

    // Try Supabase if configured (table: whatsapp_subscribers)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('whatsapp_subscribers')
          .insert([{
            name: newSub.name,
            phone: newSub.phone,
            source_menu: newSub.source_menu,
            status: 'pending'
          }])
          .select()
          .single()

        if (error) {
          console.warn('Supabase whatsapp_subscribers note:', error.message)
        } else if (data) {
          newSub.id = data.id
        }
      } catch (err) {
        console.warn('Error inserting to Supabase whatsapp_subscribers:', err)
      }
    }

    whatsappSubscriptions.value = [newSub, ...whatsappSubscriptions.value]
    persist(STORAGE_KEY_WHATSAPP_SUBS, whatsappSubscriptions.value)

    return {
      success: true,
      alreadyRegistered: false,
      subscriber: newSub,
      groupUrl
    }
  }

  function updateWhatsAppSubscriptionStatus(id: string, status: WhatsAppSubscriptionStatus) {
    const sub = whatsappSubscriptions.value.find(s => s.id === id)
    if (sub) {
      sub.status = status
      sub.updated_at = new Date().toISOString()
      persist(STORAGE_KEY_WHATSAPP_SUBS, whatsappSubscriptions.value)

      if (isSupabaseConfigured) {
        supabase
          .from('whatsapp_subscribers')
          .update({ status, updated_at: sub.updated_at })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error updating status in Supabase:', error)
          })
      }
    }
  }

  function deleteWhatsAppSubscription(id: string) {
    whatsappSubscriptions.value = whatsappSubscriptions.value.filter(s => s.id !== id)
    persist(STORAGE_KEY_WHATSAPP_SUBS, whatsappSubscriptions.value)

    if (isSupabaseConfigured) {
      supabase
        .from('whatsapp_subscribers')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting subscription in Supabase:', error)
        })
    }
  }

  // Export subscribers to CSV file
  function exportSubscribersToCSV() {
    const headers = ['Nombre', 'Celular', 'Carta de Origen', 'Estado', 'Fecha de Registro']
    const rows = whatsappSubscriptions.value.map(s => [
      `"${(s.name || 'Cliente anónimo').replace(/"/g, '""')}"`,
      `"${s.phone}"`,
      `"${s.source_menu === 'bar' ? 'Carta del Bar' : 'Carta Principal'}"`,
      `"${s.status}"`,
      `"${new Date(s.created_at).toLocaleString('es-PE')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Suscriptores-Las-Delicias-${new Date().toISOString().substring(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Computed metrics
  const activeProducts = computed(() => products.value.filter(p => p.disponible))
  const unavailableProducts = computed(() => products.value.filter(p => !p.disponible))
  const pendingSubscriptionsCount = computed(() =>
    whatsappSubscriptions.value.filter(s => s.status === 'pending').length
  )

  return {
    categories,
    products,
    config,
    whatsappSubscriptions,
    activeProducts,
    unavailableProducts,
    pendingSubscriptionsCount,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    updateCategory,
    toggleCategoryActive,
    updateConfig,
    restoreDefaults,
    subscribeToWhatsApp,
    updateWhatsAppSubscriptionStatus,
    deleteWhatsAppSubscription,
    exportSubscribersToCSV,
    isRealtimeMenuConnected,
    isSupabaseConfigured
  }
}
