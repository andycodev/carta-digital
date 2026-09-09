-- ==============================================================================
-- SQL PARA SUPABASE: Las Delicias Restobar
-- Suscriptores de WhatsApp, Registro de Visitas y Configuraciones
-- ==============================================================================

-- 1. TABLA: whatsapp_subscribers (Almacena clientes suscritos a novedades)
CREATE TABLE IF NOT EXISTS public.whatsapp_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    phone VARCHAR(30) NOT NULL UNIQUE,
    source_menu VARCHAR(20) NOT NULL DEFAULT 'main' CHECK (source_menu IN ('main', 'bar')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'joined', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas rápidas y prevención de duplicados
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscribers_source ON public.whatsapp_subscribers(source_menu);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscribers_status ON public.whatsapp_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscribers_created ON public.whatsapp_subscribers(created_at DESC);

-- 2. TABLA: menu_visits (Registro de visitas anónimas por carta y origen)
CREATE TABLE IF NOT EXISTS public.menu_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_type VARCHAR(20) NOT NULL CHECK (menu_type IN ('main', 'bar')),
    visitor_id VARCHAR(64) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'direct',
    table_number VARCHAR(20),
    visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para métricas eficientes (hoy, 7 días, 30 días y totales)
CREATE INDEX IF NOT EXISTS idx_menu_visits_type_date ON public.menu_visits(menu_type, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_visits_visitor_date ON public.menu_visits(visitor_id, visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_visits_source ON public.menu_visits(source);

-- 3. TABLA: restaurant_settings / configuraciones
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    nombre_negocio VARCHAR(150) DEFAULT 'Las Delicias Restobar',
    subtitulo VARCHAR(255) DEFAULT 'Sabor, música y buenos momentos',
    telefono_whatsapp VARCHAR(30) DEFAULT '+51 987 654 321',
    whatsapp_group_url TEXT DEFAULT 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE',
    whatsapp_subscription_enabled BOOLEAN DEFAULT TRUE,
    mostrar_precios_carta BOOLEAN DEFAULT TRUE,
    mostrar_precios_flyers BOOLEAN DEFAULT TRUE,
    musica_activa BOOLEAN DEFAULT FALSE,
    musica_url TEXT DEFAULT 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    musica_volumen INT DEFAULT 35,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar configuración inicial por defecto si no existe
INSERT INTO public.restaurant_settings (id, nombre_negocio, subtitulo, whatsapp_group_url, whatsapp_subscription_enabled, mostrar_precios_carta, mostrar_precios_flyers)
VALUES ('default', 'Las Delicias Restobar', 'Sabor, música y buenos momentos', 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE', TRUE, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    whatsapp_group_url = COALESCE(public.restaurant_settings.whatsapp_group_url, EXCLUDED.whatsapp_group_url),
    whatsapp_subscription_enabled = COALESCE(public.restaurant_settings.whatsapp_subscription_enabled, EXCLUDED.whatsapp_subscription_enabled),
    mostrar_precios_carta = COALESCE(public.restaurant_settings.mostrar_precios_carta, EXCLUDED.mostrar_precios_carta),
    mostrar_precios_flyers = COALESCE(public.restaurant_settings.mostrar_precios_flyers, EXCLUDED.mostrar_precios_flyers);

-- ==============================================================================
-- SEGURIDAD CON ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- A. RLS para whatsapp_subscribers
ALTER TABLE public.whatsapp_subscribers ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier visitante público pueda registrarse una sola vez
DROP POLICY IF EXISTS "Public users can insert subscriber" ON public.whatsapp_subscribers;
CREATE POLICY "Public users can insert subscriber"
ON public.whatsapp_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Administradores autenticados pueden ver, filtrar y gestionar suscriptores
DROP POLICY IF EXISTS "Authenticated users can select subscribers" ON public.whatsapp_subscribers;
CREATE POLICY "Authenticated users can select subscribers"
ON public.whatsapp_subscribers
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON public.whatsapp_subscribers;
CREATE POLICY "Authenticated users can update subscribers"
ON public.whatsapp_subscribers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON public.whatsapp_subscribers;
CREATE POLICY "Authenticated users can delete subscribers"
ON public.whatsapp_subscribers
FOR DELETE
TO authenticated
USING (true);


-- B. RLS para menu_visits
ALTER TABLE public.menu_visits ENABLE ROW LEVEL SECURITY;

-- Permitir que cualquier visitante registre su visita anónima
DROP POLICY IF EXISTS "Public users can insert menu visit" ON public.menu_visits;
CREATE POLICY "Public users can insert menu visit"
ON public.menu_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo administradores pueden consultar métricas de visitas
DROP POLICY IF EXISTS "Authenticated users can view visits" ON public.menu_visits;
CREATE POLICY "Authenticated users can view visits"
ON public.menu_visits
FOR SELECT
TO authenticated
USING (true);


-- C. RLS para restaurant_settings
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Configuración legible públicamente (para conocer el enlace del grupo y estado de suscripción)
DROP POLICY IF EXISTS "Public can view settings" ON public.restaurant_settings;
CREATE POLICY "Public can view settings"
ON public.restaurant_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Solo administradores pueden modificar configuración
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.restaurant_settings;
CREATE POLICY "Authenticated can update settings"
ON public.restaurant_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
