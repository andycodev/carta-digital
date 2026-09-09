# Configuración del Video Promocional de la Carta del Bar

## Ubicación del Video (Opción Local - Requerida)

El video del Bar debe alojarse localmente en la carpeta `/public/videos/` del proyecto.

**Pasos:**
1. Crea la carpeta `/public/videos/` en tu proyecto (si no existe)
   - Ruta completa: `d:\PROJECTS\carta-digital\public\videos\`
2. Sube tu archivo de video (MP4) a esa carpeta
   - Nombre recomendado: `bar-promo.mp4`
   - Ruta completa: `d:\PROJECTS\carta-digital\public\videos\bar-promo.mp4`

**Requisitos del video:**
- Formato: MP4 (H.264 codec)
- Resolución recomendada: 1920x1080 (1080p) o 1280x720 (720p)
- Tamaño máximo: 50 MB (para evitar tiempos de carga largos)
- Duración: 15-60 segundos (loop automático)
- Audio: El video debe tener audio (se reproducirá con sonido en el modal)

## Configuración en el Sistema

### Desde el Panel de Administración
1. Accede a `/admin/config`
2. Busca la sección **"Carta del Bar & Coctelería"**
3. En el campo **"URL del Video Promocional"**:
   - Usa la ruta relativa: `/videos/bar-promo.mp4`
4. Haz clic en **"Guardar Configuración del Bar"**

### Desde Supabase (Base de Datos)
Si usas Supabase, también puedes configurarlo directamente en la base de datos:

1. Accede al panel de Supabase
2. Ve a la tabla `restaurant_settings`
3. Busca el registro con `id = 'default'`
4. Actualiza el campo `bar_video_url` con: `/videos/bar-promo.mp4`
5. Guarda los cambios

El sistema sincronizará automáticamente la configuración con la aplicación.

## Dónde se Muestra el Video

**IMPORTANTE:** El video SOLO se muestra en el modal "Zona del Bar", NO en la vista `/bar`.

- **Vista `/bar`:** Muestra el hero con información del Bar, pero sin video
- **Modal "Zona del Bar":** Se abre desde la carta principal (`/`) y muestra el video con audio

## Ubicación del Código

- **Configuración:** `src/composables/useMenuStore.ts` (DEFAULT_CONFIG)
- **Modal del Bar:** `src/components/BarModal.vue`
- **Panel de Admin:** `src/views/admin/AdminConfig.vue`
- **Tipos:** `src/types/database.ts` (AppConfig)

## Verificación

Para verificar que el video se muestra correctamente:
1. Abre la carta digital principal (`/`)
2. Haz clic en el banner "Carta de Bar & Coctelería" o en el botón flotante "Zona Bar"
3. El modal debería mostrar el video con audio
4. En móviles, el video debe adaptarse al ancho de la pantalla

## Solución de Problemas

**El video no se muestra en el modal:**
- Verifica que el archivo exista en `/public/videos/bar-promo.mp4`
- Verifica que la ruta en la configuración sea `/videos/bar-promo.mp4`
- Recarga la página después de cambiar la configuración

**El video no tiene audio:**
- Asegúrate de que el archivo MP4 tenga audio
- Los navegadores pueden bloquear el autoplay con sonido - el usuario debe interactuar primero
- Esto es normal y no requiere configuración adicional

**El video se ve pixelado:**
- Considera usar una resolución más alta (1080p)
- Para YouTube, el streaming se adapta automáticamente a la conexión
