-- ==============================================================================
-- Tabla de Suscripciones al Grupo de WhatsApp de Las Delicias Restobar
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    phone VARCHAR(30) NOT NULL,
    consent BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'contacted',
                'joined',
                'rejected'
            )
        ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices recomendados para optimización de consultas
CREATE INDEX IF NOT EXISTS whatsapp_subscriptions_status_idx
ON public.whatsapp_subscriptions(status);

-- Evitar registros duplicados del mismo número de celular
CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_subscriptions_phone_unique
ON public.whatsapp_subscriptions(phone);

-- ==============================================================================
-- Políticas de Seguridad a Nivel de Fila (Row Level Security - RLS)
-- ==============================================================================

ALTER TABLE public.whatsapp_subscriptions ENABLE ROW LEVEL SECURITY;

-- Permitir únicamente inserciones públicas con consentimiento explícito
DROP POLICY IF EXISTS "Public users can create subscriptions" ON public.whatsapp_subscriptions;
CREATE POLICY "Public users can create subscriptions"
ON public.whatsapp_subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (
    consent = TRUE
);

-- Política para que usuarios autenticados (administradores) puedan leer y gestionar
DROP POLICY IF EXISTS "Authenticated admins can select subscriptions" ON public.whatsapp_subscriptions;
CREATE POLICY "Authenticated admins can select subscriptions"
ON public.whatsapp_subscriptions
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated admins can update subscriptions" ON public.whatsapp_subscriptions;
CREATE POLICY "Authenticated admins can update subscriptions"
ON public.whatsapp_subscriptions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can delete subscriptions" ON public.whatsapp_subscriptions;
CREATE POLICY "Authenticated admins can delete subscriptions"
ON public.whatsapp_subscriptions
FOR DELETE
TO authenticated
USING (true);
