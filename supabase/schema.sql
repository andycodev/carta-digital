-- ==============================================================================
-- CARTA DIGITAL PWA (RESTAURANTE & BAR) - ESQUEMA SUPABASE POSTGRESQL + SEED
-- ==============================================================================

-- 1. Estructura de tablas
CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  siempre_disponible boolean DEFAULT false,
  activo boolean DEFAULT true,
  orden int DEFAULT 1
);

CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  precio numeric(10, 2) NOT NULL,
  imagen_url text,
  disponible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE categorias;
ALTER PUBLICATION supabase_realtime ADD TABLE productos;

-- 3. Políticas de seguridad (Row Level Security - RLS)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes si se vuelve a ejecutar
DROP POLICY IF EXISTS "Permitir lectura publica de categorias activas" ON categorias;
DROP POLICY IF EXISTS "Permitir lectura publica de productos disponibles" ON productos;

-- Lectura pública para comensales (anon y authenticated)
CREATE POLICY "Permitir lectura publica de categorias activas"
  ON categorias FOR SELECT
  TO anon, authenticated
  USING (activo = true);

CREATE POLICY "Permitir lectura publica de productos disponibles"
  ON productos FOR SELECT
  TO anon, authenticated
  USING (disponible = true);

-- 4. Datos Semilla (Seed inicial para pruebas de turnos y bar)
-- Limpiar datos previos si existen
TRUNCATE TABLE productos, categorias CASCADE;

-- Insertar Categorías
INSERT INTO categorias (id, nombre, hora_inicio, hora_fin, siempre_disponible, orden) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Desayunos', '07:00:00', '11:59:59', false, 1),
  ('22222222-2222-2222-2222-222222222222', 'Almuerzos', '12:00:00', '17:59:59', false, 2),
  ('33333333-3333-3333-3333-333333333333', 'Cenas', '18:00:00', '23:59:59', false, 3),
  ('44444444-4444-4444-4444-444444444444', 'Bar & Coctelería', '00:00:00', '23:59:59', true, 4);

-- Insertar Productos: Desayunos
INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, disponible) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tostada Francesa Artesanal', 'Brioche caramelizado con frutos rojos silvestres, crema chantilly a la vainilla de Papantla y sirope de maple puro.', 12.50, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Huevos Benedictinos Trufados', 'Huevos pochados sobre muffin inglés tostado, jamón serrano crujiente y holandesa con toque de trufa negra.', 14.00, 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Bowl de Açaí Amazónico', 'Açaí orgánico batido con plátano, granola de la casa, semillas de chía, fresas y miel de agave.', 9.80, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80', true),
  ('11111111-1111-1111-1111-111111111111', 'Café Filtrado Geisha', 'Café de especialidad preparado en método V60 con notas a jazmín y durazno.', 4.50, null, true);

-- Insertar Productos: Almuerzos
INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, disponible) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Ceviche Clásico Apaltado', 'Pesca del día en leche de tigre al ají limo, cubos de palta braseada, camote glaseado y choclo tierno.', 16.50, 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Bife Angosto a la Leña (350g)', 'Corte de res madurado 28 días, mantequilla de romero y chimichurri rústico servido con papas nativas doradas.', 26.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Risotto de Hongos Silvestres', 'Arroz carnaroli con variedad de setas porcini, aceite de trufa blanca y lascas de Parmigiano Reggiano 24 meses.', 18.00, 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80', true),
  ('22222222-2222-2222-2222-222222222222', 'Ensalada Burrata Di Bufala', 'Burrata fresca con tomates reliquia confitados, pesto de albahaca fresca y reducción de balsámico añejo.', 13.50, null, true);

-- Insertar Productos: Cenas
INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, disponible) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Salmón Glaseado al Miso', 'Filete de salmón noruego con glaseado de miso dulce, puré de coliflor y edamames salteados al sésamo.', 22.50, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', true),
  ('33333333-3333-3333-3333-333333333333', 'Costillar Braseado 12 Horas', 'Costillas de cerdo en reducción de vino tinto y especias orientales con puré de camote amarillo.', 21.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', true),
  ('33333333-3333-3333-3333-333333333333', 'Tartar de Atún Rojo Bluefin', 'Atún fresco cortado a cuchillo, emulsión de wasabi, sésamo tostado y wontons crujientes.', 17.50, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', true),
  ('33333333-3333-3333-3333-333333333333', 'Carpaccio de Res & Alcaparras', 'Láminas finas de lomo fino, alcaparras fritas, rúcula selvática y vinagreta dijon.', 14.00, null, true);

-- Insertar Productos: Bar & Coctelería
INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, disponible) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Smoked Old Fashioned de Autor', 'Bourbon infusionado con higos y canela, bitter de naranja amarga y humo de madera de roble.', 13.50, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'Pisco Sour Catedral', 'Pisco Quebranta premium, zumo de limón fresco, jarabe de goma y gotas de amargo de angostura.', 11.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'Espresso Martini Botánico', 'Vodka premium, licor de café de la casa, shot de espresso recién extraído y licor de flor de saúco.', 12.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'Gin Tonic Romero & Cardamomo', 'Gin artesanal botánico, agua tónica premium, rama de romero flameada y bayas de enebro.', 11.50, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', true),
  ('44444444-4444-4444-4444-444444444444', 'Negroni Sbagliato Riserva', 'Campari, vermut rosso reserva especial, espumante prosecco brut y piel de naranja valenciana.', 12.50, null, true);
