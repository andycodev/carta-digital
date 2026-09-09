import { ref, onMounted, onUnmounted } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import type { Categoria, Producto } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

// Fallback seed data used if Supabase is not yet configured
const MOCK_CATEGORIES: Categoria[] = [
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

const MOCK_PRODUCTS: Producto[] = [
  // Desayunos
  {
    id: 'p-1',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Tostada Francesa Artesanal',
    descripcion: 'Brioche caramelizado con frutos rojos silvestres, crema chantilly a la vainilla de Papantla y sirope de maple puro.',
    precio: 12.50,
    imagen_url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-2',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Huevos Benedictinos Trufados',
    descripcion: 'Huevos pochados sobre muffin inglés tostado, jamón serrano crujiente y holandesa con toque de trufa negra.',
    precio: 14.00,
    imagen_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-3',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Bowl de Açaí Amazónico',
    descripcion: 'Açaí orgánico batido con plátano, granola de la casa, semillas de chía, fresas y miel de agave.',
    precio: 9.80,
    imagen_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-4',
    categoria_id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Café Filtrado Geisha',
    descripcion: 'Café de especialidad preparado en método V60 con notas a jazmín y durazno.',
    precio: 4.50,
    imagen_url: null,
    disponible: true
  },

  // Almuerzos
  {
    id: 'p-5',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Ceviche Clásico Apaltado',
    descripcion: 'Pesca del día en leche de tigre al ají limo, cubos de palta braseada, camote glaseado y choclo tierno.',
    precio: 16.50,
    imagen_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-6',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Bife Angosto a la Leña (350g)',
    descripcion: 'Corte de res madurado 28 días, mantequilla de romero y chimichurri rústico servido con papas nativas doradas.',
    precio: 26.00,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-7',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Risotto de Hongos Silvestres',
    descripcion: 'Arroz carnaroli con variedad de setas porcini, aceite de trufa blanca y lascas de Parmigiano Reggiano 24 meses.',
    precio: 18.00,
    imagen_url: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-8',
    categoria_id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Ensalada Burrata Di Bufala',
    descripcion: 'Burrata fresca con tomates reliquia confitados, pesto de albahaca fresca y reducción de balsámico añejo.',
    precio: 13.50,
    imagen_url: null,
    disponible: true
  },

  // Cenas
  {
    id: 'p-9',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Salmón Glaseado al Miso',
    descripcion: 'Filete de salmón noruego con glaseado de miso dulce, puré de coliflor y edamames salteados al sésamo.',
    precio: 22.50,
    imagen_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-10',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Costillar Braseado 12 Horas',
    descripcion: 'Costillas de cerdo en reducción de vino tinto y especias orientales con puré de camote amarillo.',
    precio: 21.00,
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-11',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Tartar de Atún Rojo Bluefin',
    descripcion: 'Atún fresco cortado a cuchillo, emulsión de wasabi, sésamo tostado y wontons crujientes.',
    precio: 17.50,
    imagen_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-12',
    categoria_id: '33333333-3333-3333-3333-333333333333',
    nombre: 'Carpaccio de Res & Alcaparras',
    descripcion: 'Láminas finas de lomo fino, alcaparras fritas, rúcula selvática y vinagreta dijon.',
    precio: 14.00,
    imagen_url: null,
    disponible: true
  },

  // Bar & Coctelería
  {
    id: 'p-13',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Smoked Old Fashioned de Autor',
    descripcion: 'Bourbon infusionado con higos y canela, bitter de naranja amarga y humo de madera de roble.',
    precio: 13.50,
    imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-14',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Pisco Sour Catedral',
    descripcion: 'Pisco Quebranta premium, zumo de limón fresco, jarabe de goma y gotas de amargo de angostura.',
    precio: 11.00,
    imagen_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-15',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Espresso Martini Botánico',
    descripcion: 'Vodka premium, licor de café de la casa, shot de espresso recién extraído y licor de flor de saúco.',
    precio: 12.00,
    imagen_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-16',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Gin Tonic Romero & Cardamomo',
    descripcion: 'Gin artesanal botánico, agua tónica premium, rama de romero flameada y bayas de enebro.',
    precio: 11.50,
    imagen_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    disponible: true
  },
  {
    id: 'p-17',
    categoria_id: '44444444-4444-4444-4444-444444444444',
    nombre: 'Negroni Sbagliato Riserva',
    descripcion: 'Campari, vermut rosso reserva especial, espumante prosecco brut y piel de naranja valenciana.',
    precio: 12.50,
    imagen_url: null,
    disponible: true
  }
]

export function useRealtimeMenu() {
  const categories = ref<Categoria[]>([])
  const products = ref<Producto[]>([])
  const isLoading = ref<boolean>(true)
  const isRealtimeConnected = ref<boolean>(false)
  const lastRealtimeEvent = ref<string | null>(null)
  let channel: RealtimeChannel | null = null

  async function fetchMenuData() {
    isLoading.value = true

    if (!isSupabaseConfigured) {
      // Use rich mock data if Supabase is not connected
      categories.value = [...MOCK_CATEGORIES]
      products.value = [...MOCK_PRODUCTS]
      isLoading.value = false
      return
    }

    try {
      // Fetch active categories
      const { data: catData, error: catError } = await supabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (catError) throw catError
      categories.value = catData || []

      // Fetch available products
      const { data: prodData, error: prodError } = await supabase
        .from('productos')
        .select('*')
        .eq('disponible', true)
        .order('nombre', { ascending: true })

      if (prodError) throw prodError
      products.value = (prodData || []).map(p => ({
        ...p,
        precio: Number(p.precio)
      }))
    } catch (err) {
      console.warn('Error fetching from Supabase, using mock fallback:', err)
      categories.value = [...MOCK_CATEGORIES]
      products.value = [...MOCK_PRODUCTS]
    } finally {
      isLoading.value = false
    }
  }

  function setupRealtimeSubscription() {
    if (!isSupabaseConfigured) return

    channel = supabase
      .channel('public:menu_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          lastRealtimeEvent.value = `${eventType} en Productos - ${new Date().toLocaleTimeString()}`

          if (eventType === 'INSERT') {
            const inserted = newRecord as Producto
            if (inserted.disponible) {
              const formatted = { ...inserted, precio: Number(inserted.precio) }
              const index = products.value.findIndex(p => p.id === formatted.id)
              if (index >= 0) {
                products.value[index] = formatted
              } else {
                products.value.push(formatted)
              }
            }
          } else if (eventType === 'UPDATE') {
            const updated = newRecord as Producto
            const formatted = { ...updated, precio: Number(updated.precio) }
            const index = products.value.findIndex(p => p.id === formatted.id)

            // Business rule: If disponible === false, remove immediately from reactive state
            if (!formatted.disponible) {
              if (index !== -1) {
                products.value.splice(index, 1)
              }
            } else {
              if (index !== -1) {
                products.value[index] = formatted
              } else {
                products.value.push(formatted)
              }
            }
          } else if (eventType === 'DELETE') {
            const deletedId = (oldRecord as { id: string })?.id
            if (deletedId) {
              products.value = products.value.filter(p => p.id !== deletedId)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categorias' },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload
          lastRealtimeEvent.value = `${eventType} en Categorías - ${new Date().toLocaleTimeString()}`

          if (eventType === 'INSERT') {
            const cat = newRecord as Categoria
            if (cat.activo && !categories.value.some(c => c.id === cat.id)) {
              categories.value.push(cat)
              categories.value.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            }
          } else if (eventType === 'UPDATE') {
            const cat = newRecord as Categoria
            const index = categories.value.findIndex(c => c.id === cat.id)
            if (!cat.activo) {
              if (index !== -1) categories.value.splice(index, 1)
            } else {
              if (index !== -1) {
                categories.value[index] = cat
              } else {
                categories.value.push(cat)
              }
              categories.value.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
            }
          } else if (eventType === 'DELETE') {
            const deletedId = (oldRecord as { id: string })?.id
            if (deletedId) {
              categories.value = categories.value.filter(c => c.id !== deletedId)
              products.value = products.value.filter(p => p.categoria_id !== deletedId)
            }
          }
        }
      )
      .subscribe((status) => {
        isRealtimeConnected.value = status === 'SUBSCRIBED'
      })
  }

  // Local helper to simulate real-time mutations for testing in preview mode
  function simulateToggleProductAvailability(productId: string) {
    const idx = products.value.findIndex(p => p.id === productId)
    if (idx !== -1) {
      // Remove product (simulating availability = false)
      products.value.splice(idx, 1)
      lastRealtimeEvent.value = `Simulación: Producto agotado/ocultado (${new Date().toLocaleTimeString()})`
    }
  }

  function simulateRestoreAllMock() {
    products.value = [...MOCK_PRODUCTS]
    lastRealtimeEvent.value = `Simulación: Carta restaurada (${new Date().toLocaleTimeString()})`
  }

  onMounted(async () => {
    await fetchMenuData()
    setupRealtimeSubscription()
  })

  onUnmounted(() => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  })

  return {
    categories,
    products,
    isLoading,
    isRealtimeConnected,
    isSupabaseConfigured,
    lastRealtimeEvent,
    fetchMenuData,
    simulateToggleProductAvailability,
    simulateRestoreAllMock
  }
}
