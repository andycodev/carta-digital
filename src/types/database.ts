export interface Categoria {
  id: string
  nombre: string
  hora_inicio: string // 'HH:mm:ss'
  hora_fin: string // 'HH:mm:ss'
  siempre_disponible: boolean
  activo: boolean
  orden: number
}

export interface Producto {
  id: string
  categoria_id: string
  nombre: string
  descripcion: string | null
  mostrar_descripcion?: boolean
  precio: number
  imagen_url: string | null
  disponible: boolean
  created_at?: string
}

export interface Mesa {
  id: string
  numero: string
  nombre: string
  activa: boolean
  qr_codigo: string
  created_at: string
}

export interface AppConfig {
  nombre_negocio: string
  subtitulo: string
  musica_activa: boolean
  musica_url: string
  musica_volumen: number
  telefono_whatsapp?: string
  whatsapp_group_url?: string
  whatsapp_subscription_enabled?: boolean
  mostrar_precios_carta?: boolean
  mostrar_precios_flyers?: boolean
}

export type WhatsAppSubscriptionStatus = 'pending' | 'contacted' | 'joined' | 'rejected'

export interface WhatsAppSubscriber {
  id: string
  name: string | null
  phone: string
  source_menu: 'main' | 'bar'
  status: WhatsAppSubscriptionStatus
  created_at: string
  updated_at?: string
}

// Alias for backwards compatibility
export type WhatsAppSubscription = WhatsAppSubscriber

export interface MenuVisit {
  id: string
  menu_type: 'main' | 'bar'
  visitor_id: string
  source: string
  table_number?: string | null
  visited_at: string
}



