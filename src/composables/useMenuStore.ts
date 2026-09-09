import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import type {
  Categoria,
  Producto,
  Mesa,
  AppConfig,
  WhatsAppSubscriber,
  WhatsAppSubscriptionStatus
} from '@/types/database'

const STORAGE_KEY_CATEGORIES = 'delicias_categories_v2'
const STORAGE_KEY_PRODUCTS = 'delicias_products_v2'
const STORAGE_KEY_MESAS = 'delicias_mesas_v2'
const STORAGE_KEY_CONFIG = 'delicias_config_v2'
const STORAGE_KEY_WHATSAPP_SUBS = 'delicias_whatsapp_subs_v1'

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

const DEFAULT_MESAS: Mesa[] = [
  { id: 'm-1', numero: '01', nombre: 'Mesa 01', activa: true, qr_codigo: 'mesa-01', created_at: new Date().toISOString() },
  { id: 'm-2', numero: '02', nombre: 'Mesa 02', activa: true, qr_codigo: 'mesa-02', created_at: new Date().toISOString() },
  { id: 'm-3', numero: '03', nombre: 'Mesa 03', activa: true, qr_codigo: 'mesa-03', created_at: new Date().toISOString() },
  { id: 'm-4', numero: '04', nombre: 'Mesa 04', activa: true, qr_codigo: 'mesa-04', created_at: new Date().toISOString() },
  { id: 'm-5', numero: '05', nombre: 'Mesa 05 (Terraza)', activa: true, qr_codigo: 'mesa-05', created_at: new Date().toISOString() },
  { id: 'm-6', numero: '06', nombre: 'Mesa 06 (VIP)', activa: true, qr_codigo: 'mesa-06', created_at: new Date().toISOString() }
]

const DEFAULT_CONFIG: AppConfig = {
  nombre_negocio: 'Las Delicias Restobar',
  subtitulo: 'Sabor, música y buenos momentos',
  musica_activa: false,
  musica_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  musica_volumen: 35,
  telefono_whatsapp: '+51 987 654 321',
  whatsapp_group_url: 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE',
  whatsapp_subscription_enabled: true,
  mostrar_precios_carta: true,
  mostrar_precios_flyers: true
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
const mesas = ref<Mesa[]>(loadInitial(STORAGE_KEY_MESAS, DEFAULT_MESAS))
const config = ref<AppConfig>(loadInitial(STORAGE_KEY_CONFIG, DEFAULT_CONFIG))
const whatsappSubscriptions = ref<WhatsAppSubscriber[]>(loadInitial(STORAGE_KEY_WHATSAPP_SUBS, DEFAULT_WHATSAPP_SUBS))

// Automatically update old slogan or missing group settings in local cache
let configChanged = false
if (config.value.subtitulo === 'Gastronomía & Coctelería de Autor') {
  config.value.subtitulo = 'Sabor, música y buenos momentos'
  configChanged = true
}
if (!config.value.whatsapp_group_url) {
  config.value.whatsapp_group_url = 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE'
  configChanged = true
}
if (config.value.whatsapp_subscription_enabled === undefined) {
  config.value.whatsapp_subscription_enabled = true
  configChanged = true
}
if (config.value.mostrar_precios_carta === undefined) {
  config.value.mostrar_precios_carta = true
  configChanged = true
}
if (config.value.mostrar_precios_flyers === undefined) {
  config.value.mostrar_precios_flyers = true
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

  // --- MESAS & QR ACTIONS ---
  function addMesa(numero: string, nombre: string) {
    const slug = `mesa-${numero.toLowerCase().replace(/\s+/g, '-')}`
    const newMesa: Mesa = {
      id: `m-${Date.now()}`,
      numero,
      nombre,
      activa: true,
      qr_codigo: slug,
      created_at: new Date().toISOString()
    }
    mesas.value.push(newMesa)
    persist(STORAGE_KEY_MESAS, mesas.value)
    return newMesa
  }

  function updateMesa(id: string, updates: Partial<Mesa>) {
    const idx = mesas.value.findIndex(m => m.id === id)
    if (idx !== -1) {
      mesas.value[idx] = { ...mesas.value[idx], ...updates }
      persist(STORAGE_KEY_MESAS, mesas.value)
    }
  }

  function deleteMesa(id: string) {
    mesas.value = mesas.value.filter(m => m.id !== id)
    persist(STORAGE_KEY_MESAS, mesas.value)
  }

  function toggleMesaActiva(id: string) {
    const m = mesas.value.find(mesa => mesa.id === id)
    if (m) {
      m.activa = !m.activa
      persist(STORAGE_KEY_MESAS, mesas.value)
    }
  }

  // --- CONFIG ACTIONS ---
  function updateConfig(updates: Partial<AppConfig>) {
    config.value = { ...config.value, ...updates }
    persist(STORAGE_KEY_CONFIG, config.value)
  }

  // Restore factory defaults
  function restoreDefaults() {
    categories.value = [...DEFAULT_CATEGORIES]
    products.value = [...DEFAULT_PRODUCTS]
    mesas.value = [...DEFAULT_MESAS]
    config.value = { ...DEFAULT_CONFIG }
    persist(STORAGE_KEY_CATEGORIES, categories.value)
    persist(STORAGE_KEY_PRODUCTS, products.value)
    persist(STORAGE_KEY_MESAS, mesas.value)
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

    const groupUrl = config.value.whatsapp_group_url || 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE'

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
  const activeMesas = computed(() => mesas.value.filter(m => m.activa))
  const pendingSubscriptionsCount = computed(() =>
    whatsappSubscriptions.value.filter(s => s.status === 'pending').length
  )

  return {
    categories,
    products,
    mesas,
    config,
    whatsappSubscriptions,
    activeProducts,
    unavailableProducts,
    activeMesas,
    pendingSubscriptionsCount,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    updateCategory,
    toggleCategoryActive,
    addMesa,
    updateMesa,
    deleteMesa,
    toggleMesaActiva,
    updateConfig,
    restoreDefaults,
    subscribeToWhatsApp,
    updateWhatsAppSubscriptionStatus,
    deleteWhatsAppSubscription,
    exportSubscribersToCSV
  }
}
