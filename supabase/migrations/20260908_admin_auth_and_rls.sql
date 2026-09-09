-- ==============================================================================
-- POLÍTICAS COMPLETAS DE SEGURIDAD Y CONTROL DE ACCESO (RLS)
-- Las Delicias Restobar - Supabase Authentication & Row Level Security
-- ==============================================================================

-- 1. SEGURIDAD PARA CATEGORÍAS (categorias)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de categorias activas" ON public.categorias;
DROP POLICY IF EXISTS "Public can view active categories" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated can view all categories" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated can insert categories" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated can update categories" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated can delete categories" ON public.categorias;

-- Público solo puede ver categorías activas; administradores autenticados ven todas
CREATE POLICY "Public can view active categories"
ON public.categorias
FOR SELECT
TO anon
USING (activo = true);

CREATE POLICY "Authenticated can view all categories"
ON public.categorias
FOR SELECT
TO authenticated
USING (true);

-- Solo administradores autenticados pueden insertar, modificar o borrar categorías
CREATE POLICY "Authenticated can insert categories"
ON public.categorias
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update categories"
ON public.categorias
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete categories"
ON public.categorias
FOR DELETE
TO authenticated
USING (true);


-- 2. SEGURIDAD PARA PRODUCTOS (productos)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir lectura publica de productos disponibles" ON public.productos;
DROP POLICY IF EXISTS "Public can view available products" ON public.productos;
DROP POLICY IF EXISTS "Authenticated can view all products" ON public.productos;
DROP POLICY IF EXISTS "Authenticated can insert products" ON public.productos;
DROP POLICY IF EXISTS "Authenticated can update products" ON public.productos;
DROP POLICY IF EXISTS "Authenticated can delete products" ON public.productos;

-- Público solo puede ver productos disponibles; administradores autenticados ven todos
CREATE POLICY "Public can view available products"
ON public.productos
FOR SELECT
TO anon
USING (disponible = true);

CREATE POLICY "Authenticated can view all products"
ON public.productos
FOR SELECT
TO authenticated
USING (true);

-- Solo administradores autenticados pueden insertar, modificar o borrar productos
CREATE POLICY "Authenticated can insert products"
ON public.productos
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
ON public.productos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete products"
ON public.productos
FOR DELETE
TO authenticated
USING (true);


-- 3. SEGURIDAD PARA CONFIGURACIONES (restaurant_settings)
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Authenticated can update settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Authenticated can insert settings" ON public.restaurant_settings;

-- Lectura pública para obtener nombre, enlaces oficiales y opciones de menú
CREATE POLICY "Public can view settings"
ON public.restaurant_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Solo administradores autenticados pueden modificar o insertar configuraciones
CREATE POLICY "Authenticated can update settings"
ON public.restaurant_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can insert settings"
ON public.restaurant_settings
FOR INSERT
TO authenticated
WITH CHECK (true);


-- 4. SEGURIDAD PARA SUSCRIPTORES DE WHATSAPP (whatsapp_subscribers)
ALTER TABLE public.whatsapp_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can insert subscriber" ON public.whatsapp_subscribers;
DROP POLICY IF EXISTS "Authenticated users can select subscribers" ON public.whatsapp_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON public.whatsapp_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON public.whatsapp_subscribers;

-- Visitantes pueden registrarse una vez con su teléfono
CREATE POLICY "Public users can insert subscriber"
ON public.whatsapp_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo administradores autenticados pueden ver la lista completa, filtrar y gestionar
CREATE POLICY "Authenticated users can select subscribers"
ON public.whatsapp_subscribers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update subscribers"
ON public.whatsapp_subscribers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subscribers"
ON public.whatsapp_subscribers
FOR DELETE
TO authenticated
USING (true);


-- 5. SEGURIDAD PARA VISITAS (menu_visits)
ALTER TABLE public.menu_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can insert menu visit" ON public.menu_visits;
DROP POLICY IF EXISTS "Authenticated users can view visits" ON public.menu_visits;
DROP POLICY IF EXISTS "Authenticated users can delete visits" ON public.menu_visits;

-- Inserción de visitas anónimas por comensales
CREATE POLICY "Public users can insert menu visit"
ON public.menu_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Solo administradores autenticados pueden consultar métricas de visitas
CREATE POLICY "Authenticated users can view visits"
ON public.menu_visits
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete visits"
ON public.menu_visits
FOR DELETE
TO authenticated
USING (true);
