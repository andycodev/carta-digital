-- ==============================================================================
-- CORRECCIÓN Y HABILITACIÓN DE CRUD COMPLETO PARA PRODUCTOS Y CATEGORÍAS
-- Las Delicias Restobar - 2026-09-09
-- ==============================================================================

-- 1. Políticas de RLS universales para PRODUCTOS
DROP POLICY IF EXISTS "Anyone can modify products" ON public.productos;
DROP POLICY IF EXISTS "Public can manage productos" ON public.productos;

CREATE POLICY "Public can manage productos"
ON public.productos
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. Políticas de RLS universales para CATEGORÍAS
DROP POLICY IF EXISTS "Anyone can modify categories" ON public.categorias;
DROP POLICY IF EXISTS "Public can manage categorias" ON public.categorias;

CREATE POLICY "Public can manage categorias"
ON public.categorias
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Asegurar que el id por defecto en productos sea gen_random_uuid()
ALTER TABLE public.productos 
ALTER COLUMN id SET DEFAULT gen_random_uuid();
