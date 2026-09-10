<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import logoImg from '@/assets/las-delicias-logo.png'
import type { Categoria, Producto } from '@/types/database'
import {
  ArrowDownTrayIcon,
  PhotoIcon,
  SunIcon,
  FireIcon,
  MoonIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  EyeIcon,
  TvIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  MapPinIcon,
  TagIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'

type FlyerFormat = 'whatsapp' | 'social' | 'tv'
type ImageFileFormat = 'png' | 'jpg' | 'jpeg'
type LogoPosition = 'center' | 'left' | 'right' | 'badge'
type FontTheme = 'serif' | 'sans' | 'condensed' | 'editorial'
type FrameStyle = 'double' | 'modern_cards' | 'minimal_lines' | 'ornamental'

interface ImageFormatOption {
  id: ImageFileFormat
  name: string
  ext: string
  mime: string
  desc: string
  badge: string
}

const imageFormatOptions: ImageFormatOption[] = [
  {
    id: 'png',
    name: 'PNG',
    ext: 'png',
    mime: 'image/png',
    desc: 'Sin compresión, máxima fidelidad y calidad de texto',
    badge: 'Sin pérdida'
  },
  {
    id: 'jpg',
    name: 'JPG',
    ext: 'jpg',
    mime: 'image/jpeg',
    desc: 'Comprimido y ligero, ideal para redes y chat',
    badge: 'Ligero'
  },
  {
    id: 'jpeg',
    name: 'JPEG',
    ext: 'jpeg',
    mime: 'image/jpeg',
    desc: 'Formato estándar universal para web y fotos',
    badge: 'Estándar'
  }
]

interface FormatOption {
  id: FlyerFormat
  name: string
  subtitle: string
  ratioText: string
  width: number
  height: number
  icon: typeof DevicePhoneMobileIcon
}

interface AIStyle {
  id: string
  name: string
  subtitle: string
  badge: string
  isDark: boolean
  bgGrad: [string, string, string]
  outerBorder: string
  innerBorder: string
  cornerAccent: string
  titleColor: string
  sloganColor: string
  textColor: string
  descColor: string
  priceColor: string
  leaderColor: string
  footerBg: string
  footerText: string
  footerSub: string
  promoGrad: [string, string, string]
  promoBorder: string
  promoTagColor: string
  promoTitleColor: string
  promoSubColor: string
}

const businessAddress = 'Calle Santa Catalina 1401 - Chongoyape'

const formatOptions: FormatOption[] = [
  {
    id: 'whatsapp',
    name: 'Estado de WhatsApp',
    subtitle: 'Formato vertical optimizado para celular',
    ratioText: 'Vertical 9:16 (1080 x 1920 px)',
    width: 1080,
    height: 1920,
    icon: DevicePhoneMobileIcon
  },
  {
    id: 'social',
    name: 'Publicación para Redes',
    subtitle: 'Formato cuadrado para feed de Instagram y Facebook',
    ratioText: 'Cuadrado 1:1 (1080 x 1080 px)',
    width: 1080,
    height: 1080,
    icon: PhotoIcon
  },
  {
    id: 'tv',
    name: 'Pantalla de TV',
    subtitle: 'Formato horizontal de alta legibilidad para 32" y 42"',
    ratioText: 'Horizontal 16:9 (1920 x 1080 px)',
    width: 1920,
    height: 1080,
    icon: TvIcon
  }
]

// Curated AI Design Styles maintaining brand identity with visual diversity
const aiStyles: AIStyle[] = [
  {
    id: 'classic',
    name: 'Clásico Las Delicias',
    subtitle: 'Luz gourmet, lino cálido y acentos cobre terracota',
    badge: 'Luz Cálida',
    isDark: false,
    bgGrad: ['#FFFFFF', '#FAF8F5', '#F4F0EA'],
    outerBorder: '#CBD5E1',
    innerBorder: '#C2410C',
    cornerAccent: '#C2410C',
    titleColor: '#0F172A',
    sloganColor: '#C2410C',
    textColor: '#0F172A',
    descColor: '#64748B',
    priceColor: '#C2410C',
    leaderColor: '#94A3B8',
    footerBg: '#0F172A',
    footerText: '#FFFFFF',
    footerSub: '#CBD5E1',
    promoGrad: ['#C2410C', '#EA580C', '#9A3412'],
    promoBorder: '#FED7AA',
    promoTagColor: '#FEF08A',
    promoTitleColor: '#FFFFFF',
    promoSubColor: '#FFEDD5'
  },
  {
    id: 'bistro_dark',
    name: 'Bistró Pizarra & Oro',
    subtitle: 'Ambiente nocturno exclusivo con reflejos dorados',
    badge: 'Gourmet Noche',
    isDark: true,
    bgGrad: ['#1A1E26', '#0F131A', '#080A0E'],
    outerBorder: '#334155',
    innerBorder: '#D97706',
    cornerAccent: '#F59E0B',
    titleColor: '#F8FAFC',
    sloganColor: '#F59E0B',
    textColor: '#F1F5F9',
    descColor: '#94A3B8',
    priceColor: '#FBBF24',
    leaderColor: '#475569',
    footerBg: '#06080B',
    footerText: '#F8FAFC',
    footerSub: '#CBD5E1',
    promoGrad: ['#B45309', '#D97706', '#78350F'],
    promoBorder: '#FDE68A',
    promoTagColor: '#FEF3C7',
    promoTitleColor: '#FFFFFF',
    promoSubColor: '#FEF3C7'
  },
  {
    id: 'cocktail_velvet',
    name: 'Coctelería Velvet',
    subtitle: 'Borgoña y azul zafiro con iluminación de restobar',
    badge: 'Bar & Lounge',
    isDark: true,
    bgGrad: ['#241224', '#150A19', '#0A040E'],
    outerBorder: '#4C1D4F',
    innerBorder: '#E11D48',
    cornerAccent: '#FB7185',
    titleColor: '#FFF1F2',
    sloganColor: '#FB7185',
    textColor: '#FFF1F2',
    descColor: '#FDA4AF',
    priceColor: '#F43F5E',
    leaderColor: '#701A4F',
    footerBg: '#0D0412',
    footerText: '#FFFFFF',
    footerSub: '#FECDD3',
    promoGrad: ['#BE123C', '#E11D48', '#881337'],
    promoBorder: '#FECDD3',
    promoTagColor: '#FFE4E6',
    promoTitleColor: '#FFFFFF',
    promoSubColor: '#FFE4E6'
  },
  {
    id: 'rustic_wood',
    name: 'Rústico Brasa & Madera',
    subtitle: 'Tonos terrosos, leña noble y calidez artesanal',
    badge: 'Artesanal',
    isDark: true,
    bgGrad: ['#261F1A', '#191310', '#0E0B09'],
    outerBorder: '#44342B',
    innerBorder: '#EA580C',
    cornerAccent: '#F97316',
    titleColor: '#FAF5EE',
    sloganColor: '#FB923C',
    textColor: '#FAF5EE',
    descColor: '#A8998D',
    priceColor: '#FB923C',
    leaderColor: '#574338',
    footerBg: '#0E0B09',
    footerText: '#FAF5EE',
    footerSub: '#D6C7BA',
    promoGrad: ['#C2410C', '#EA580C', '#7C2D12'],
    promoBorder: '#FDBA74',
    promoTagColor: '#FED7AA',
    promoTitleColor: '#FFFFFF',
    promoSubColor: '#FED7AA'
  },
  {
    id: 'modern_minimal',
    name: 'Minimalista Editorial',
    subtitle: 'Blanco perla, tipografía pura y diseño contemporáneo',
    badge: 'Moderno',
    isDark: false,
    bgGrad: ['#FFFFFF', '#FAFAFA', '#F3F4F6'],
    outerBorder: '#E2E8F0',
    innerBorder: '#0F172A',
    cornerAccent: '#0F172A',
    titleColor: '#0F172A',
    sloganColor: '#475569',
    textColor: '#0F172A',
    descColor: '#64748B',
    priceColor: '#0F172A',
    leaderColor: '#CBD5E1',
    footerBg: '#0F172A',
    footerText: '#FFFFFF',
    footerSub: '#94A3B8',
    promoGrad: ['#0F172A', '#1E293B', '#0F172A'],
    promoBorder: '#94A3B8',
    promoTagColor: '#CBD5E1',
    promoTitleColor: '#FFFFFF',
    promoSubColor: '#94A3B8'
  }
]

const { categories, products, config } = useMenuStore()

const selectedFormat = ref<FlyerFormat>('whatsapp')
const selectedCategoryId = ref<string>('')
const selectedAiStyleId = ref<string>('classic')
const showDescriptionsInFlyer = ref(true)
const showPricesInFlyer = ref<boolean>(config.value.mostrar_precios_flyers !== false)
// Permite incluir todos los platos de la carta correspondiente (por defecto true para flyers completos)
const showOnlyAvailableInFlyer = ref<boolean>(false)

// Structural variation states (Logo position, typography, and frame design)
const selectedLogoPosition = ref<LogoPosition>('center')
const selectedFontTheme = ref<FontTheme>('serif')
const selectedFrameStyle = ref<FrameStyle>('double')

// Font scale control state & presets (Aumentar / Reducir tamaño de letra)
const savedFontScale = localStorage.getItem('carta_flyer_font_scale')
const flyerFontScale = ref<number>(savedFontScale ? Math.min(1.5, Math.max(0.9, parseFloat(savedFontScale))) : 1.0)

const fontScalePresets = [
  { id: 'normal', label: 'Normal', pct: '100%', scale: 1.0 },
  { id: 'medium', label: 'Mediana', pct: '+15%', scale: 1.15 },
  { id: 'large', label: 'Grande', pct: '+30%', scale: 1.30 },
  { id: 'xlarge', label: 'Gigante', pct: '+45%', scale: 1.45 }
]

function adjustFontScale(delta: number) {
  const next = Math.round((flyerFontScale.value + delta) * 100) / 100
  if (next >= 0.9 && next <= 1.5) {
    flyerFontScale.value = next
  }
}

watch(flyerFontScale, (val) => {
  try {
    localStorage.setItem('carta_flyer_font_scale', String(val))
  } catch {
    // ignore
  }
})

// Image file format state (PNG, JPG, JPEG)
const savedImageFormat = typeof localStorage !== 'undefined' ? (localStorage.getItem('carta_flyer_image_format') as ImageFileFormat | null) : null
const selectedImageFormat = ref<ImageFileFormat>(
  savedImageFormat === 'jpg' || savedImageFormat === 'jpeg' || savedImageFormat === 'png'
    ? savedImageFormat
    : 'png'
)

watch(selectedImageFormat, (val) => {
  try {
    localStorage.setItem('carta_flyer_image_format', val)
  } catch {
    // ignore
  }
})

const isGenerating = ref(false)
const downloadingCatId = ref<string | null>(null)
const flyerPreviewUrl = ref<string | null>(null)
const cachedLogo = ref<HTMLImageElement | null>(null)
const aiGenerationToast = ref<string | null>(null)

// Mobile & Compact UX states
const activeMobileTab = ref<'preview' | 'controls'>('preview')
const accordions = ref({
  format: true,
  content: true,
  style: true,
  downloads: false
})

function toggleAccordion(section: 'format' | 'content' | 'style' | 'downloads') {
  accordions.value[section] = !accordions.value[section]
}

const activeSlogan = computed(() => {
  return config.value.subtitulo || 'Sabor, música y buenos momentos'
})

const currentStyle = computed(() => {
  return aiStyles.find(s => s.id === selectedAiStyleId.value) || aiStyles[0]
})

function getFontFamilies(theme: FontTheme) {
  switch (theme) {
    case 'serif':
      return {
        title: "'Playfair Display', Georgia, serif",
        dish: "'Playfair Display', Georgia, serif",
        desc: "italic 'Playfair Display', Georgia, serif",
        price: "'Playfair Display', Georgia, serif",
        slogan: "italic 'Playfair Display', Georgia, serif"
      }
    case 'sans':
      return {
        title: "'Outfit', 'Inter', system-ui, sans-serif",
        dish: "'Outfit', 'Inter', system-ui, sans-serif",
        desc: "'Inter', system-ui, sans-serif",
        price: "'Outfit', 'Inter', system-ui, sans-serif",
        slogan: "'Outfit', system-ui, sans-serif"
      }
    case 'condensed':
      return {
        title: "'Impact', 'Trebuchet MS', sans-serif",
        dish: "'Trebuchet MS', 'Impact', sans-serif",
        desc: "'Trebuchet MS', sans-serif",
        price: "'Trebuchet MS', sans-serif",
        slogan: "'Trebuchet MS', sans-serif"
      }
    case 'editorial':
    default:
      return {
        title: "'Palatino Linotype', 'Book Antiqua', serif",
        dish: "'Palatino Linotype', 'Book Antiqua', serif",
        desc: "italic 'Palatino Linotype', 'Book Antiqua', serif",
        price: "'Palatino Linotype', 'Book Antiqua', serif",
        slogan: "'Palatino Linotype', 'Book Antiqua', serif"
      }
  }
}

function loadLogo(): Promise<HTMLImageElement> {
  if (cachedLogo.value) {
    return Promise.resolve(cachedLogo.value)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      cachedLogo.value = img
      resolve(img)
    }
    img.onerror = () => {
      console.warn('Could not load logo image for flyer canvas.')
      reject(new Error('Logo image failed to load'))
    }
    img.src = logoImg
    if (img.complete && img.naturalWidth > 0) {
      cachedLogo.value = img
      resolve(img)
    }
  })
}

const mainCartas = computed(() => categories.value)

const currentCategory = computed(() => {
  return categories.value.find(c => c.id === selectedCategoryId.value) || categories.value[0]
})

function getDishesForCategory(catId: string): Producto[] {
  if (!catId) return []
  return products.value.filter(p => {
    if (p.categoria_id?.trim() !== catId.trim()) return false
    if (showOnlyAvailableInFlyer.value && !p.disponible) return false
    return true
  })
}

function getCategoryIcon(name: string, siempre247: boolean) {
  const n = name.toLowerCase()
  if (siempre247 || n.includes('bar') || n.includes('coctel') || n.includes('bebida')) {
    return SparklesIcon
  }
  if (n.includes('desayuno')) return SunIcon
  if (n.includes('almuerzo')) return FireIcon
  if (n.includes('cena')) return MoonIcon
  return BuildingStorefrontIcon
}

function sanitizeFilename(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// Safely truncate and fit text into canvas with dynamic measurement to avoid overlap
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (!text) return ''
  if (ctx.measureText(text).width <= maxWidth) return text
  let low = 0
  let high = text.length
  let best = ''
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = text.substring(0, mid).trim() + '...'
    if (ctx.measureText(candidate).width <= maxWidth) {
      best = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return best || text.substring(0, 3) + '...'
}

// Draw framed perimeter based on selected frame style
function drawPerimeterFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: AIStyle,
  frame: FrameStyle
) {
  if (frame === 'double' || frame === 'ornamental') {
    ctx.strokeStyle = style.outerBorder
    ctx.lineWidth = 4
    ctx.strokeRect(35, 35, w - 70, h - 70)

    ctx.strokeStyle = style.innerBorder
    ctx.lineWidth = 2.5
    ctx.strokeRect(50, 50, w - 100, h - 100)

    // Corner accents
    for (const [cx, cy] of [[50, 50], [w - 50, 50], [50, h - 50], [w - 50, h - 50]]) {
      ctx.fillStyle = style.cornerAccent
      if (frame === 'ornamental') {
        ctx.beginPath()
        ctx.arc(cx, cy, 8, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(cx - 6, cy - 6, 12, 12)
      }
    }
  } else if (frame === 'minimal_lines') {
    ctx.strokeStyle = style.innerBorder
    ctx.lineWidth = 1.5
    ctx.strokeRect(45, 45, w - 90, h - 90)

    // Minimal diamond marks
    for (const [cx, cy] of [[45, 45], [w - 45, 45], [45, h - 45], [w - 45, h - 45]]) {
      ctx.fillStyle = style.cornerAccent
      ctx.beginPath()
      ctx.moveTo(cx, cy - 7)
      ctx.lineTo(cx + 7, cy)
      ctx.lineTo(cx, cy + 7)
      ctx.lineTo(cx - 7, cy)
      ctx.closePath()
      ctx.fill()
    }
  } else if (frame === 'modern_cards') {
    drawRoundedRect(ctx, 35, 35, w - 70, h - 70, 24)
    ctx.strokeStyle = style.innerBorder
    ctx.lineWidth = 2.5
    ctx.stroke()
  }
}

// Novel Daily Design Generator (IA Engine)
function generateNovelDesignVariation() {
  const logoPositions: LogoPosition[] = ['center', 'left', 'right', 'badge']
  const fontThemes: FontTheme[] = ['serif', 'sans', 'condensed', 'editorial']
  const frameStyles: FrameStyle[] = ['double', 'modern_cards', 'minimal_lines', 'ornamental']

  // Advance each dimension for a fresh unique combination
  const nextLogoIdx = (logoPositions.indexOf(selectedLogoPosition.value) + 1) % logoPositions.length
  selectedLogoPosition.value = logoPositions[nextLogoIdx]

  const nextFontIdx = (fontThemes.indexOf(selectedFontTheme.value) + 1) % fontThemes.length
  selectedFontTheme.value = fontThemes[nextFontIdx]

  const nextFrameIdx = (frameStyles.indexOf(selectedFrameStyle.value) + 1) % frameStyles.length
  selectedFrameStyle.value = frameStyles[nextFrameIdx]

  const nextStyleIdx = (aiStyles.findIndex(s => s.id === selectedAiStyleId.value) + 1) % aiStyles.length
  selectedAiStyleId.value = aiStyles[nextStyleIdx].id

  const logoLabels = { center: 'Centro', left: 'Izquierda', right: 'Derecha', badge: 'Badge Sello' }
  const fontLabels = { serif: 'Serif Clásica', sans: 'Sans Moderna', condensed: 'Bistró Urbano', editorial: 'Editorial' }

  aiGenerationToast.value = `¡Nuevo Diseño del Día!: Logo en ${logoLabels[selectedLogoPosition.value]} • Fuente: ${fontLabels[selectedFontTheme.value]}`
  setTimeout(() => {
    aiGenerationToast.value = null
  }, 3200)
}

// -------------------------------------------------------------
// RENDER ENGINE 1: WHATSAPP (VERTICAL 9:16 - 1080 x 1920 px)
// -------------------------------------------------------------
async function renderFlyerWhatsApp(cat: Categoria, dishes: Producto[], style: AIStyle): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Context error')

  const fonts = getFontFamilies(selectedFontTheme.value)
  const scale = flyerFontScale.value
  const titleScale = 1 + (scale - 1) * 0.4
  const headerScale = 1 + (scale - 1) * 0.35

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920)
  bgGrad.addColorStop(0, style.bgGrad[0])
  bgGrad.addColorStop(0.35, style.bgGrad[1])
  bgGrad.addColorStop(1, style.bgGrad[2])
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1080, 1920)

  // Perimeter frame
  drawPerimeterFrame(ctx, 1080, 1920, style, selectedFrameStyle.value)

  let currentY = 85
  const isAlmuerzo = (cat.nombre || '').toLowerCase().includes('almuerzo')

  // --- HEADER SECTION ADAPTING TO LOGO POSITION ---
  if (selectedLogoPosition.value === 'left') {
    // Logo on Left, Titles on Right
    const logoSize = 190
    const logoX = 85
    const logoY = 85

    try {
      const logo = await loadLogo()
      ctx.save()
      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
      ctx.strokeStyle = style.innerBorder
      ctx.lineWidth = 3
      ctx.stroke()
    } catch {
      // fallback
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(38 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', 300, 140)

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(20 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, 300, 175)

    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(42 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 300, 235)

    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(18 * headerScale)}px ${fonts.desc}`
    ctx.fillText(cat.siempre_disponible ? 'Servicio Continuo • Todo el Día' : `Horario: ${cat.hora_inicio.substring(0, 5)} a ${cat.hora_fin.substring(0, 5)} hrs`, 300, 268)

    currentY = 305
  } else if (selectedLogoPosition.value === 'right') {
    // Logo on Right, Titles on Left
    const logoSize = 190
    const logoX = 1080 - 85 - logoSize
    const logoY = 85

    try {
      const logo = await loadLogo()
      ctx.save()
      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
      ctx.strokeStyle = style.innerBorder
      ctx.lineWidth = 3
      ctx.stroke()
    } catch {
      // fallback
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(38 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', 85, 140)

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(20 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, 85, 175)

    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(42 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 85, 235)

    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(18 * headerScale)}px ${fonts.desc}`
    ctx.fillText(cat.siempre_disponible ? 'Servicio Continuo • Todo el Día' : `Horario: ${cat.hora_inicio.substring(0, 5)} a ${cat.hora_fin.substring(0, 5)} hrs`, 85, 268)

    currentY = 305
  } else {
    // Center or Badge Style
    const logoSize = selectedLogoPosition.value === 'badge' ? 220 : 240
    const logoX = (1080 - logoSize) / 2
    const logoY = 80

    try {
      const logo = await loadLogo()
      ctx.save()
      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 3, 0, Math.PI * 2)
      ctx.strokeStyle = style.innerBorder
      ctx.lineWidth = 3
      ctx.stroke()

      if (selectedLogoPosition.value === 'badge') {
        ctx.beginPath()
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 8, 0, Math.PI * 2)
        ctx.strokeStyle = style.outerBorder
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    } catch {
      ctx.fillStyle = style.titleColor
      ctx.font = `bold ${Math.round(44 * titleScale)}px ${fonts.title}`
      ctx.textAlign = 'center'
      ctx.fillText('LAS DELICIAS RESTOBAR', 540, 150)
    }

    currentY = logoY + logoSize + 35
    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(24 * headerScale)}px ${fonts.slogan}`
    ctx.textAlign = 'center'
    ctx.fillText(activeSlogan.value, 540, currentY)

    currentY += 55
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(48 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 540, currentY)

    currentY += 35
    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(22 * headerScale)}px ${fonts.desc}`
    if (cat.siempre_disponible) {
      ctx.fillText('Servicio Continuo • Disponible Todo el Día', 540, currentY)
    } else {
      ctx.fillText(`Horario: ${cat.hora_inicio.substring(0, 5)} a ${cat.hora_fin.substring(0, 5)} hrs`, 540, currentY)
    }
  }

  // Divider
  currentY += 35
  ctx.beginPath()
  ctx.moveTo(100, currentY)
  ctx.lineTo(980, currentY)
  ctx.strokeStyle = style.outerBorder
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = style.innerBorder
  ctx.beginPath()
  ctx.arc(540, currentY, 5, 0, Math.PI * 2)
  ctx.fill()

  // Promo Banner (Almuerzo)
  if (isAlmuerzo) {
    const badgeY = currentY + 22
    const badgeW = 860
    const badgeH = 135
    const badgeX = (1080 - badgeW) / 2

    const pGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH)
    pGrad.addColorStop(0, style.promoGrad[0])
    pGrad.addColorStop(0.5, style.promoGrad[1])
    pGrad.addColorStop(1, style.promoGrad[2])

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 22)
    ctx.fillStyle = pGrad
    ctx.fill()

    ctx.strokeStyle = style.promoBorder
    ctx.lineWidth = 2.5
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillStyle = style.promoTagColor
    ctx.font = `bold ${Math.round(17 * headerScale)}px ${fonts.dish}`
    ctx.fillText('★ PROMOCIÓN ESPECIAL DE ALMUERZO ★', 540, badgeY + 34)

    ctx.fillStyle = style.promoTitleColor
    ctx.font = `900 ${Math.round(46 * titleScale)}px ${fonts.title}`
    ctx.fillText('MENÚS DESDE S/ 10', 540, badgeY + 84)

    ctx.fillStyle = style.promoSubColor
    ctx.font = `italic bold ${Math.round(22 * headerScale)}px ${fonts.slogan}`
    ctx.fillText('"¡Buen sabor, buen precio!"', 540, badgeY + 117)

    currentY = badgeY + badgeH + 45
  } else {
    currentY += 50
  }

  // Dishes list: ensure ALL dishes of the carta are shown without cutting off
  const isTwoCol = dishes.length > 12
  const items = dishes.slice(0, 24)
  const availableHeight = 1720 - currentY

  if (isTwoCol) {
    const colCount = Math.ceil(items.length / 2)
    const colW = 440
    const col1X = 75
    const col2X = 565
    const rowH = Math.min(95, Math.floor(availableHeight / colCount))
    const dishFontSize = Math.round(20 * scale)
    const priceFontSize = Math.round(22 * scale)
    const descFontSize = Math.round(15 * scale)
    const descOffset = Math.round(22 * Math.max(1, scale * 0.9))

    for (let i = 0; i < items.length; i++) {
      const dish = items[i]
      const isCol2 = i >= colCount
      const colX = isCol2 ? col2X : col1X
      const rowIndex = isCol2 ? i - colCount : i
      const itemY = currentY + (rowIndex * rowH)

      if (selectedFrameStyle.value === 'modern_cards') {
        const cardBg = style.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
        drawRoundedRect(ctx, colX - 10, itemY - Math.round(26 * Math.min(1.2, scale)), colW + 20, rowH - 10, 12)
        ctx.fillStyle = cardBg
        ctx.fill()
      }

      let priceStr = ''
      let priceWidth = 0
      if (showPricesInFlyer.value) {
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        priceStr = `S/ ${Number(dish.precio).toFixed(2)}`
        priceWidth = ctx.measureText(priceStr).width
      }

      ctx.textAlign = 'left'
      ctx.fillStyle = style.textColor
      ctx.font = `bold ${dishFontSize}px ${fonts.dish}`

      const maxCharsWidth = showPricesInFlyer.value ? (colW - priceWidth - 18) : colW
      const displayName = fitText(ctx, dish.nombre, maxCharsWidth)
      ctx.fillText(displayName, colX, itemY)

      if (showPricesInFlyer.value) {
        ctx.textAlign = 'right'
        ctx.fillStyle = style.priceColor
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        ctx.fillText(priceStr, colX + colW, itemY)

        // Dotted leader line
        ctx.font = `bold ${dishFontSize}px ${fonts.dish}`
        const nameWidth = ctx.measureText(displayName).width
        const dotStartX = colX + nameWidth + 12
        const dotEndX = colX + colW - priceWidth - 12
        if (dotEndX > dotStartX) {
          ctx.beginPath()
          ctx.setLineDash([3, 5])
          ctx.strokeStyle = style.leaderColor
          ctx.lineWidth = 1.2
          ctx.moveTo(dotStartX, itemY - 6)
          ctx.lineTo(dotEndX, itemY - 6)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      if (showDescriptionsInFlyer.value && dish.descripcion && rowH >= Math.round(75 * scale)) {
        ctx.textAlign = 'left'
        ctx.fillStyle = style.descColor
        ctx.font = `${descFontSize}px ${fonts.desc}`
        const desc = fitText(ctx, dish.descripcion, colW)
        ctx.fillText(desc, colX, itemY + descOffset)
      }
    }
  } else {
    // Single column for up to 12 dishes
    const maxRowH = Math.round(105 * Math.max(1, scale * 0.95))
    const rowHeight = items.length > 0 ? Math.min(maxRowH, Math.floor(availableHeight / items.length)) : 95

    const dishFontSize = Math.round(27 * scale)
    const priceFontSize = Math.round(29 * scale)
    const descFontSize = Math.round(19 * scale)
    const descOffset = Math.round(28 * Math.max(1, scale * 0.9))

    for (let i = 0; i < items.length; i++) {
      const dish = items[i]
      const itemY = currentY + (i * rowHeight)

      if (selectedFrameStyle.value === 'modern_cards') {
        const cardBg = style.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
        drawRoundedRect(ctx, 80, itemY - Math.round(32 * Math.min(1.2, scale)), 920, rowHeight - 12, 14)
        ctx.fillStyle = cardBg
        ctx.fill()
      }

      let priceStr = ''
      let priceWidth = 0
      if (showPricesInFlyer.value) {
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        priceStr = `S/ ${Number(dish.precio).toFixed(2)}`
        priceWidth = ctx.measureText(priceStr).width
      }

      ctx.textAlign = 'left'
      ctx.fillStyle = style.textColor
      ctx.font = `bold ${dishFontSize}px ${fonts.dish}`

      const maxCharsWidth = showPricesInFlyer.value ? (970 - priceWidth - 25) - 110 : 860
      const displayName = fitText(ctx, dish.nombre, maxCharsWidth)
      ctx.fillText(displayName, 110, itemY)

      if (showPricesInFlyer.value) {
        ctx.textAlign = 'right'
        ctx.fillStyle = style.priceColor
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        ctx.fillText(priceStr, 970, itemY)

        // Dotted leader line
        ctx.font = `bold ${dishFontSize}px ${fonts.dish}`
        const nameWidth = ctx.measureText(displayName).width
        const dotStartX = 110 + nameWidth + 15
        const dotEndX = 970 - priceWidth - 15
        if (dotEndX > dotStartX) {
          ctx.beginPath()
          ctx.setLineDash([4, 6])
          ctx.strokeStyle = style.leaderColor
          ctx.lineWidth = 1.5
          ctx.moveTo(dotStartX, itemY - 7)
          ctx.lineTo(dotEndX, itemY - 7)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Description if enabled
      if (showDescriptionsInFlyer.value && dish.descripcion && rowHeight >= Math.round(80 * scale)) {
        ctx.textAlign = 'left'
        ctx.fillStyle = style.descColor
        ctx.font = `${descFontSize}px ${fonts.desc}`
        const desc = fitText(ctx, dish.descripcion, 860)
        ctx.fillText(desc, 110, itemY + descOffset)
      }
    }
  }

  // Footer bar
  const footerY = 1750
  ctx.fillStyle = style.footerBg
  ctx.fillRect(60, footerY - 45, 960, 130)
  ctx.fillStyle = style.innerBorder
  ctx.fillRect(60, footerY - 45, 960, 4)

  ctx.textAlign = 'center'
  ctx.fillStyle = style.footerText
  ctx.font = `bold ${Math.round(24 * headerScale)}px ${fonts.title}`
  ctx.fillText('¡VISÍTANOS Y DISFRUTA DE NUESTRA CARTA DIGITAL!', 540, footerY - 5)

  ctx.fillStyle = style.footerSub
  ctx.font = `bold ${Math.round(18 * headerScale)}px ${fonts.dish}`
  ctx.fillText(businessAddress, 540, footerY + 26)

  ctx.fillStyle = style.descColor
  ctx.font = `${Math.round(16 * headerScale)}px ${fonts.desc}`
  ctx.fillText('Escanea nuestro código QR en el local • Las Delicias Restobar', 540, footerY + 54)

  return canvas
}

// -------------------------------------------------------------
// RENDER ENGINE 2: REDES SOCIALES (CUADRADO 1:1 - 1080 x 1080 px)
// -------------------------------------------------------------
async function renderFlyerSocial(cat: Categoria, dishes: Producto[], style: AIStyle): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Context error')

  const fonts = getFontFamilies(selectedFontTheme.value)
  const scale = flyerFontScale.value
  const titleScale = 1 + (scale - 1) * 0.4
  const headerScale = 1 + (scale - 1) * 0.35

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1080)
  bgGrad.addColorStop(0, style.bgGrad[0])
  bgGrad.addColorStop(0.5, style.bgGrad[1])
  bgGrad.addColorStop(1, style.bgGrad[2])
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1080, 1080)

  // Frame
  drawPerimeterFrame(ctx, 1080, 1080, style, selectedFrameStyle.value)

  let currentY = 50
  const isAlmuerzo = (cat.nombre || '').toLowerCase().includes('almuerzo')

  if (selectedLogoPosition.value === 'left') {
    const logoSize = 130
    const logoX = 65
    const logoY = 48

    try {
      const logo = await loadLogo()
      ctx.save()
      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
      ctx.strokeStyle = style.innerBorder
      ctx.lineWidth = 2.5
      ctx.stroke()
    } catch {
      // fallback
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(28 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', 220, 85)

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(16 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, 220, 112)

    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(32 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 220, 155)

    currentY = 195
  } else if (selectedLogoPosition.value === 'right') {
    const logoSize = 130
    const logoX = 1080 - 65 - logoSize
    const logoY = 48

    try {
      const logo = await loadLogo()
      ctx.save()
      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
      ctx.strokeStyle = style.innerBorder
      ctx.lineWidth = 2.5
      ctx.stroke()
    } catch {
      // fallback
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(28 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', 70, 85)

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(16 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, 70, 112)

    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(32 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 70, 155)

    currentY = 195
  } else {
    // Center or badge
    const logoSize = 150
    const logoX = (1080 - logoSize) / 2

    try {
      const logo = await loadLogo()
      ctx.save()
      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, currentY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(logo, logoX, currentY, logoSize, logoSize)
      ctx.restore()

      ctx.beginPath()
      ctx.arc(logoX + logoSize / 2, currentY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
      ctx.strokeStyle = style.innerBorder
      ctx.lineWidth = 2.5
      ctx.stroke()

      currentY += logoSize + 16
    } catch {
      currentY += 60
    }

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(18 * headerScale)}px ${fonts.slogan}`
    ctx.textAlign = 'center'
    ctx.fillText(activeSlogan.value, 540, currentY)

    currentY += 32
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(36 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 540, currentY)

    currentY += 24
    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(16 * headerScale)}px ${fonts.desc}`
    if (cat.siempre_disponible) {
      ctx.fillText('Servicio Continuo • Todo el Día', 540, currentY)
    } else {
      ctx.fillText(`Horario: ${cat.hora_inicio.substring(0, 5)} a ${cat.hora_fin.substring(0, 5)} hrs`, 540, currentY)
    }
  }

  // Divider
  currentY += 20
  ctx.beginPath()
  ctx.moveTo(140, currentY)
  ctx.lineTo(940, currentY)
  ctx.strokeStyle = style.outerBorder
  ctx.lineWidth = 1.5
  ctx.stroke()

  if (isAlmuerzo) {
    const badgeY = currentY + 12
    const badgeW = 820
    const badgeH = 88
    const badgeX = (1080 - badgeW) / 2

    const pGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH)
    pGrad.addColorStop(0, style.promoGrad[0])
    pGrad.addColorStop(0.5, style.promoGrad[1])
    pGrad.addColorStop(1, style.promoGrad[2])

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 16)
    ctx.fillStyle = pGrad
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.fillStyle = style.promoTagColor
    ctx.font = `bold ${Math.round(15 * headerScale)}px ${fonts.dish}`
    ctx.fillText('★ PROMOCIÓN ESPECIAL ★', 540, badgeY + 26)

    ctx.fillStyle = style.promoTitleColor
    ctx.font = `900 ${Math.round(30 * titleScale)}px ${fonts.title}`
    ctx.fillText('MENÚS DESDE S/ 10', 540, badgeY + 54)

    ctx.fillStyle = style.promoSubColor
    ctx.font = `italic bold ${Math.round(16 * headerScale)}px ${fonts.slogan}`
    ctx.fillText('"¡Buen sabor, buen precio!"', 540, badgeY + 78)

    currentY = badgeY + badgeH + 28
  } else {
    currentY += 38
  }

  // 2-Columns grid for compact square: show all dishes of the carta
  const items = dishes.slice(0, 18)
  const isTwoCol = items.length > 5

  if (isTwoCol) {
    const colCount = Math.ceil(items.length / 2)
    const colW = 430
    const col1X = 75
    const col2X = 575
    const rowH = Math.min(85, Math.floor((950 - currentY) / colCount))

    const dishFontSize = Math.round(19 * scale)
    const priceFontSize = Math.round(20 * scale)
    const descFontSize = Math.round(14 * scale)
    const descOffset = Math.round(20 * Math.max(1, scale * 0.9))

    for (let i = 0; i < items.length; i++) {
      const dish = items[i]
      const isCol2 = i >= colCount
      const colX = isCol2 ? col2X : col1X
      const rowIndex = isCol2 ? i - colCount : i
      const itemY = currentY + (rowIndex * rowH)

      if (selectedFrameStyle.value === 'modern_cards') {
        const cardBg = style.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
        drawRoundedRect(ctx, colX - 10, itemY - Math.round(24 * Math.min(1.2, scale)), colW + 20, rowH - 8, 10)
        ctx.fillStyle = cardBg
        ctx.fill()
      }

      let priceStr = ''
      let priceWidth = 0
      if (showPricesInFlyer.value) {
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        priceStr = `S/ ${Number(dish.precio).toFixed(2)}`
        priceWidth = ctx.measureText(priceStr).width
      }

      ctx.textAlign = 'left'
      ctx.fillStyle = style.textColor
      ctx.font = `bold ${dishFontSize}px ${fonts.dish}`

      const maxLen = showPricesInFlyer.value ? (colW - priceWidth - 18) : colW
      const dName = fitText(ctx, dish.nombre, maxLen)
      ctx.fillText(dName, colX, itemY)

      if (showPricesInFlyer.value) {
        ctx.textAlign = 'right'
        ctx.fillStyle = style.priceColor
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        ctx.fillText(priceStr, colX + colW, itemY)

        // Leader
        ctx.font = `bold ${dishFontSize}px ${fonts.dish}`
        const nameWidth = ctx.measureText(dName).width
        const dotStart = colX + nameWidth + 10
        const dotEnd = colX + colW - priceWidth - 10
        if (dotEnd > dotStart) {
          ctx.beginPath()
          ctx.setLineDash([3, 4])
          ctx.strokeStyle = style.leaderColor
          ctx.lineWidth = 1
          ctx.moveTo(dotStart, itemY - 5)
          ctx.lineTo(dotEnd, itemY - 5)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      if (showDescriptionsInFlyer.value && dish.descripcion && rowH >= Math.round(62 * scale)) {
        ctx.textAlign = 'left'
        ctx.fillStyle = style.descColor
        ctx.font = `${descFontSize}px ${fonts.desc}`
        const desc = fitText(ctx, dish.descripcion, colW)
        ctx.fillText(desc, colX, itemY + descOffset)
      }
    }
  } else {
    const rowH = Math.min(95, Math.floor((950 - currentY) / Math.max(items.length, 1)))
    const dishFontSize = Math.round(24 * scale)
    const priceFontSize = Math.round(26 * scale)
    const descFontSize = Math.round(16 * scale)
    const descOffset = Math.round(24 * Math.max(1, scale * 0.9))

    for (let i = 0; i < items.length; i++) {
      const dish = items[i]
      const itemY = currentY + (i * rowH)

      if (selectedFrameStyle.value === 'modern_cards') {
        const cardBg = style.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
        drawRoundedRect(ctx, 120, itemY - Math.round(26 * Math.min(1.2, scale)), 840, rowH - 10, 12)
        ctx.fillStyle = cardBg
        ctx.fill()
      }

      let priceStr = ''
      let priceWidth = 0
      if (showPricesInFlyer.value) {
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        priceStr = `S/ ${Number(dish.precio).toFixed(2)}`
        priceWidth = ctx.measureText(priceStr).width
      }

      ctx.textAlign = 'left'
      ctx.fillStyle = style.textColor
      ctx.font = `bold ${dishFontSize}px ${fonts.dish}`

      const maxLen = showPricesInFlyer.value ? (940 - priceWidth - 25) - 140 : 800
      const dName = fitText(ctx, dish.nombre, maxLen)
      ctx.fillText(dName, 140, itemY)

      if (showPricesInFlyer.value) {
        ctx.textAlign = 'right'
        ctx.fillStyle = style.priceColor
        ctx.font = `bold ${priceFontSize}px ${fonts.price}`
        ctx.fillText(priceStr, 940, itemY)

        ctx.font = `bold ${dishFontSize}px ${fonts.dish}`
        const nameWidth = ctx.measureText(dName).width
        const dotStart = 140 + nameWidth + 15
        const dotEnd = 940 - priceWidth - 15
        if (dotEnd > dotStart) {
          ctx.beginPath()
          ctx.setLineDash([3, 5])
          ctx.strokeStyle = style.leaderColor
          ctx.lineWidth = 1.5
          ctx.moveTo(dotStart, itemY - 6)
          ctx.lineTo(dotEnd, itemY - 6)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      if (showDescriptionsInFlyer.value && dish.descripcion && rowH >= Math.round(72 * scale)) {
        ctx.textAlign = 'left'
        ctx.fillStyle = style.descColor
        ctx.font = `${descFontSize}px ${fonts.desc}`
        const desc = fitText(ctx, dish.descripcion, 800)
        ctx.fillText(desc, 140, itemY + descOffset)
      }
    }
  }

  // Footer bar
  ctx.fillStyle = style.footerBg
  ctx.fillRect(50, 975, 980, 68)
  ctx.textAlign = 'center'
  ctx.fillStyle = style.footerText
  ctx.font = `bold ${Math.round(16 * headerScale)}px ${fonts.title}`
  ctx.fillText('LAS DELICIAS RESTOBAR  •  SABOR, MÚSICA Y BUENOS MOMENTOS', 540, 1002)
  ctx.fillStyle = style.footerSub
  ctx.font = `bold ${Math.round(14 * headerScale)}px ${fonts.dish}`
  ctx.fillText(`${businessAddress}  •  Carta Digital en Vivo`, 540, 1025)

  return canvas
}

// -------------------------------------------------------------
// RENDER ENGINE 3: PANTALLA DE TV (HORIZONTAL 16:9 - 1920 x 1080 px)
// STRICT ZERO OVERLAP ARCHITECTURE
// -------------------------------------------------------------
async function renderFlyerTV(cat: Categoria, dishes: Producto[], style: AIStyle): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1080
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Context error')

  const fonts = getFontFamilies(selectedFontTheme.value)
  const scale = flyerFontScale.value
  const titleScale = 1 + (scale - 1) * 0.4
  const headerScale = 1 + (scale - 1) * 0.35

  // Gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080)
  bgGrad.addColorStop(0, style.bgGrad[0])
  bgGrad.addColorStop(0.5, style.bgGrad[1])
  bgGrad.addColorStop(1, style.bgGrad[2])
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1920, 1080)

  // Frame
  drawPerimeterFrame(ctx, 1920, 1080, style, selectedFrameStyle.value)

  // HEADER LOGO POSITIONING (Strictly contained between Y: 40 and Y: 190)
  let logoX = 85
  const logoY = 50
  const logoSize = 130

  if (selectedLogoPosition.value === 'right') {
    logoX = 1920 - 85 - logoSize
  } else if (selectedLogoPosition.value === 'center' || selectedLogoPosition.value === 'badge') {
    logoX = (1920 - logoSize) / 2
  }

  try {
    const logo = await loadLogo()
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
    ctx.restore()

    ctx.beginPath()
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2)
    ctx.strokeStyle = style.innerBorder
    ctx.lineWidth = 3
    ctx.stroke()
  } catch {
    // fallback
  }

  // Titles placement
  if (selectedLogoPosition.value === 'left') {
    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(44 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', 245, 100)

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(22 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, 245, 138)

    ctx.textAlign = 'right'
    ctx.fillStyle = style.titleColor
    ctx.font = `900 ${Math.round(38 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 1835, 105)

    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(19 * headerScale)}px ${fonts.desc}`
    ctx.fillText(cat.siempre_disponible ? 'Servicio Continuo 24/7' : `Horario: ${cat.hora_inicio.substring(0, 5)} - ${cat.hora_fin.substring(0, 5)} hrs`, 1835, 142)
  } else if (selectedLogoPosition.value === 'right') {
    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `900 ${Math.round(38 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 85, 105)

    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(19 * headerScale)}px ${fonts.desc}`
    ctx.fillText(cat.siempre_disponible ? 'Servicio Continuo 24/7' : `Horario: ${cat.hora_inicio.substring(0, 5)} - ${cat.hora_fin.substring(0, 5)} hrs`, 85, 142)

    ctx.textAlign = 'right'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(44 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', logoX - 30, 100)

    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(22 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, logoX - 30, 138)
  } else {
    // Center or badge
    ctx.textAlign = 'left'
    ctx.fillStyle = style.titleColor
    ctx.font = `bold ${Math.round(38 * titleScale)}px ${fonts.title}`
    ctx.fillText('LAS DELICIAS RESTOBAR', 85, 105)
    ctx.fillStyle = style.sloganColor
    ctx.font = `bold ${Math.round(20 * headerScale)}px ${fonts.slogan}`
    ctx.fillText(activeSlogan.value, 85, 142)

    ctx.textAlign = 'right'
    ctx.fillStyle = style.titleColor
    ctx.font = `900 ${Math.round(38 * titleScale)}px ${fonts.title}`
    ctx.fillText(`CARTA DE ${cat.nombre.toUpperCase()}`, 1835, 105)
    ctx.fillStyle = style.descColor
    ctx.font = `${Math.round(19 * headerScale)}px ${fonts.desc}`
    ctx.fillText(cat.siempre_disponible ? 'Servicio Continuo 24/7' : `Horario: ${cat.hora_inicio.substring(0, 5)} - ${cat.hora_fin.substring(0, 5)} hrs`, 1835, 142)
  }

  // Divider Line at Y: 205
  ctx.beginPath()
  ctx.moveTo(70, 205)
  ctx.lineTo(1850, 205)
  ctx.strokeStyle = style.outerBorder
  ctx.lineWidth = 2.5
  ctx.stroke()

  ctx.fillStyle = style.innerBorder
  ctx.beginPath()
  ctx.arc(960, 205, 6, 0, Math.PI * 2)
  ctx.fill()

  // Promo Banner (Almuerzo TV)
  const isAlmuerzo = (cat.nombre || '').toLowerCase().includes('almuerzo')
  let contentStartY = 270

  if (isAlmuerzo) {
    const promoY = 222
    const promoW = 1760
    const promoH = 68
    const promoX = (1920 - promoW) / 2

    const pGrad = ctx.createLinearGradient(promoX, promoY, promoX + promoW, promoY + promoH)
    pGrad.addColorStop(0, style.promoGrad[0])
    pGrad.addColorStop(0.5, style.promoGrad[1])
    pGrad.addColorStop(1, style.promoGrad[2])

    drawRoundedRect(ctx, promoX, promoY, promoW, promoH, 16)
    ctx.fillStyle = pGrad
    ctx.fill()

    ctx.strokeStyle = style.promoBorder
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.textAlign = 'left'
    ctx.fillStyle = style.promoTagColor
    ctx.font = `bold ${Math.round(16 * headerScale)}px ${fonts.dish}`
    ctx.fillText('★ PROMOCIÓN ESPECIAL DE ALMUERZO ★', promoX + 30, promoY + 42)

    ctx.textAlign = 'center'
    ctx.fillStyle = style.promoTitleColor
    ctx.font = `900 ${Math.round(32 * titleScale)}px ${fonts.title}`
    ctx.fillText('MENÚS DESDE S/ 10', 960, promoY + 44)

    ctx.textAlign = 'right'
    ctx.fillStyle = style.promoSubColor
    ctx.font = `italic bold ${Math.round(20 * headerScale)}px ${fonts.slogan}`
    ctx.fillText('"¡Buen sabor, buen precio!"', promoX + promoW - 30, promoY + 42)

    contentStartY = 350
  }

  // Two columns of dishes
  const maxDishes = 24
  const items = dishes.slice(0, maxDishes)
  const colCount = Math.ceil(items.length / 2)

  const colW = 820
  const col1X = 85
  const col2X = 1015
  const maxAvailableH = 960 - contentStartY
  const rowH = colCount > 0 ? Math.min(115, Math.floor(maxAvailableH / colCount)) : 90

  const dishFontSize = Math.round(26 * scale)
  const priceFontSize = Math.round(28 * scale)
  const descFontSize = Math.round(20 * scale)
  const descOffset = Math.round(28 * Math.max(1, scale * 0.9))

  for (let i = 0; i < items.length; i++) {
    const dish = items[i]
    const isCol2 = i >= colCount
    const colX = isCol2 ? col2X : col1X
    const rowIndex = isCol2 ? i - colCount : i
    const itemY = contentStartY + (rowIndex * rowH)

    if (selectedFrameStyle.value === 'modern_cards') {
      const cardBg = style.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
      drawRoundedRect(ctx, colX - 15, itemY - Math.round(26 * Math.min(1.2, scale)), colW + 30, rowH - 8, 12)
      ctx.fillStyle = cardBg
      ctx.fill()
    }

    let priceStr = ''
    let priceWidth = 0
    if (showPricesInFlyer.value) {
      ctx.font = `bold ${priceFontSize}px ${fonts.price}`
      priceStr = `S/ ${Number(dish.precio).toFixed(2)}`
      priceWidth = ctx.measureText(priceStr).width
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = style.textColor
    ctx.font = `bold ${dishFontSize}px ${fonts.dish}`

    const maxLen = showPricesInFlyer.value ? (colW - priceWidth - 25) : colW
    const dName = fitText(ctx, dish.nombre, maxLen)
    ctx.fillText(dName, colX, itemY)

    if (showPricesInFlyer.value) {
      ctx.textAlign = 'right'
      ctx.fillStyle = style.priceColor
      ctx.font = `bold ${priceFontSize}px ${fonts.price}`
      ctx.fillText(priceStr, colX + colW, itemY)

      ctx.font = `bold ${dishFontSize}px ${fonts.dish}`
      const nameWidth = ctx.measureText(dName).width
      const dotStart = colX + nameWidth + 16
      const dotEnd = colX + colW - priceWidth - 16
      if (dotEnd > dotStart) {
        ctx.beginPath()
        ctx.setLineDash([4, 6])
        ctx.strokeStyle = style.leaderColor
        ctx.lineWidth = 2
        ctx.moveTo(dotStart, itemY - 8)
        ctx.lineTo(dotEnd, itemY - 8)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    if (showDescriptionsInFlyer.value && dish.descripcion && rowH >= Math.round(80 * scale)) {
      ctx.textAlign = 'left'
      ctx.fillStyle = style.descColor
      ctx.font = `${descFontSize}px ${fonts.desc}`
      const desc = fitText(ctx, dish.descripcion, colW - 20)
      ctx.fillText(desc, colX, itemY + descOffset)
    }
  }

  // Footer
  ctx.fillStyle = style.footerBg
  ctx.fillRect(60, 980, 1800, 58)

  ctx.textAlign = 'center'
  ctx.fillStyle = style.footerText
  ctx.font = `bold ${Math.round(20 * headerScale)}px ${fonts.title}`
  ctx.fillText(
    `LAS DELICIAS RESTOBAR  •  ${businessAddress}  •  CARTA DIGITAL EN VIVO`,
    960,
    1016
  )

  return canvas
}

async function renderFlyerCanvas(cat: Categoria, format: FlyerFormat, style: AIStyle): Promise<HTMLCanvasElement> {
  const catDishes = getDishesForCategory(cat.id)

  if (format === 'tv') {
    return renderFlyerTV(cat, catDishes, style)
  } else if (format === 'social') {
    return renderFlyerSocial(cat, catDishes, style)
  } else {
    return renderFlyerWhatsApp(cat, catDishes, style)
  }
}

async function generatePreview() {
  const cat = currentCategory.value
  if (!cat) return

  isGenerating.value = true
  try {
    const canvas = await renderFlyerCanvas(cat, selectedFormat.value, currentStyle.value)
    flyerPreviewUrl.value = canvas.toDataURL('image/png')
  } catch (err) {
    console.error('Error generating preview:', err)
  } finally {
    isGenerating.value = false
  }
}

async function downloadFlyerForCategory(cat: Categoria, formatChoice?: ImageFileFormat) {
  const imgFormat = formatChoice || selectedImageFormat.value
  downloadingCatId.value = cat.id
  try {
    const canvas = await renderFlyerCanvas(cat, selectedFormat.value, currentStyle.value)
    const cleanCatName = sanitizeFilename(cat.nombre)
    const formatSuffix = selectedFormat.value === 'tv'
      ? 'TV-16x9'
      : selectedFormat.value === 'social'
        ? 'Redes-1x1'
        : 'WhatsApp-9x16'

    const styleSuffix = sanitizeFilename(currentStyle.value.name)
    const ext = imgFormat === 'jpg' ? 'jpg' : imgFormat === 'jpeg' ? 'jpeg' : 'png'
    const filename = `Flyer-Las-Delicias-${cleanCatName}-${formatSuffix}-${styleSuffix}.${ext}`

    const dataUrl = (imgFormat === 'jpg' || imgFormat === 'jpeg')
      ? canvas.toDataURL('image/jpeg', 0.95)
      : canvas.toDataURL('image/png')

    const link = document.createElement('a')
    link.setAttribute('download', filename)
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Error downloading flyer:', err)
  } finally {
    downloadingCatId.value = null
  }
}

// ── COMPARTIR FLYER POR WHATSAPP ─────────────────────────────────────────────
const isSharingWhatsApp = ref(false)
const copiedMessage = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

function getWhatsAppFlyerMessage(cat: Categoria): string {
  const name = (cat.nombre || '').toLowerCase()

  let intro = ''
  if (cat.siempre_disponible || name.includes('bar') || name.includes('coctel') || name.includes('trago')) {
    intro = '🍹 *Carta del Bar* — Disfruta de nuestros tragos, cervezas, piqueos y buena música.'
  } else if (name.includes('desayuno')) {
    intro = '☀️ *Carta del desayuno de hoy* — Empieza tu día disfrutando nuestros deliciosos desayunos.'
  } else if (name.includes('almuerzo')) {
    intro = '🍽️ *Carta del almuerzo de hoy* — Ven y disfruta nuestros ricos platos preparados para ti.'
  } else if (name.includes('cena')) {
    intro = '🌙 *Carta de la cena de hoy* — Ven y disfruta nuestros ricos platos.'
  } else {
    intro = `✨ *Carta de ${cat.nombre} de hoy* — Ven y disfruta nuestros ricos platos preparados para ti.`
  }

  return `${intro}\n\n📍 *Las Delicias Restobar*\nCalle Santa Catalina 1401 - Chongoyape`
}

async function copyWhatsAppMessage(cat: Categoria) {
  const msg = getWhatsAppFlyerMessage(cat)
  try {
    await navigator.clipboard.writeText(msg)
    copiedMessage.value = true
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => {
      copiedMessage.value = false
    }, 3000)
  } catch (e) {
    console.warn('Error al copiar texto:', e)
  }
}

async function shareFlyerToWhatsApp(cat: Categoria) {
  if (!cat) return
  isSharingWhatsApp.value = true

  try {
    // 1. Renderizar el canvas exacto del flyer actual (sin alterar el diseño)
    const canvas = await renderFlyerCanvas(cat, selectedFormat.value, currentStyle.value)
    const cleanCatName = sanitizeFilename(cat.nombre)
    const formatSuffix = selectedFormat.value === 'tv'
      ? 'TV-16x9'
      : selectedFormat.value === 'social'
        ? 'Redes-1x1'
        : 'WhatsApp-9x16'

    const styleSuffix = sanitizeFilename(currentStyle.value.name)
    const filename = `Flyer-Las-Delicias-${cleanCatName}-${formatSuffix}-${styleSuffix}.png`
    const message = getWhatsAppFlyerMessage(cat)

    // Convertir canvas a Blob y File
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('No se pudo generar la imagen del flyer')

    const file = new File([blob], filename, { type: 'image/png' })

    // 2. Si el navegador soporta compartir archivos directamente (móviles Android, iOS, etc.)
    const canShareFiles = typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })

    if (canShareFiles) {
      try {
        await navigator.share({
          title: `Flyer ${cat.nombre} - Las Delicias Restobar`,
          text: message,
          files: [file]
        })
        return
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') return
        console.warn('Fallo al invocar navigator.share, procediendo con método alternativo:', shareErr)
      }
    }

    // 3. Fallback para computadoras / navegadores de escritorio:
    // A) Copiar imagen al portapapeles para que solo deban presionar Ctrl+V en WhatsApp
    let imageCopied = false
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        imageCopied = true
      }
    } catch (clipErr) {
      console.warn('Portapapeles no disponible para imágenes:', clipErr)
    }

    // B) Descargar la imagen
    const downloadLink = document.createElement('a')
    downloadLink.download = filename
    downloadLink.href = URL.createObjectURL(blob)
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)

    // C) Abrir WhatsApp Web con el texto prellenado
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')

    if (imageCopied) {
      alert('¡Flyer copiado al portapapeles y descargado!\n\nSe abrió WhatsApp con el mensaje. Presiona Ctrl + V (Pegar) en el chat para adjuntar el flyer.')
    }
  } catch (err: any) {
    console.error('Error al compartir flyer por WhatsApp:', err)
    alert(`No se pudo compartir el flyer: ${err.message || 'Error inesperado'}`)
  } finally {
    isSharingWhatsApp.value = false
  }
}

// Re-generate preview whenever any layout, font size, content parameter, or products change
watch([
  selectedCategoryId,
  selectedFormat,
  selectedAiStyleId,
  showDescriptionsInFlyer,
  showPricesInFlyer,
  showOnlyAvailableInFlyer,
  selectedLogoPosition,
  selectedFontTheme,
  selectedFrameStyle,
  flyerFontScale,
  products,
  categories
], () => {
  generatePreview()
}, { deep: true })

onMounted(async () => {
  if (categories.value.length > 0) {
    if (!selectedCategoryId.value) {
      selectedCategoryId.value = categories.value[0].id
    }
    await generatePreview()
  }
})

watch(categories, (cats) => {
  if (cats.length > 0 && !selectedCategoryId.value) {
    selectedCategoryId.value = cats[0].id
    generatePreview()
  }
}, { immediate: true })
</script>

<template>
  <div class="space-y-4">
    <!-- Header: Compact Bar with Slogan and Direct AI Randomizer Button -->
    <div
      class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <SparklesIcon class="w-5 h-5 text-brand-primary" />
          <span>Generador de Flyers & Diseños del Día</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Diseños adaptados para WhatsApp, Redes y TV sin alterar los datos del menú.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div
          class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
          <span>{{ activeSlogan }}</span>
        </div>

        <button type="button" @click="generateNovelDesignVariation"
          class="btn btn-sm bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white border-none rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
          <SparklesIcon class="w-4 h-4 text-amber-300 animate-spin" />
          <span>✨ Nuevo Diseño del Día (IA)</span>
        </button>
      </div>
    </div>

    <!-- AI Notification Toast -->
    <transition name="fade">
      <div v-if="aiGenerationToast"
        class="px-4 py-2.5 rounded-xl bg-purple-900 text-purple-100 text-xs flex items-center justify-between shadow-md border border-purple-700">
        <div class="flex items-center gap-2">
          <SparklesIcon class="w-4 h-4 text-amber-300" />
          <span><strong>Diseño Aplicado:</strong> {{ aiGenerationToast }}</span>
        </div>
        <span class="text-[10px] bg-purple-800 px-2 py-0.5 rounded-full text-purple-200 font-mono">Listo</span>
      </div>
    </transition>

    <!-- Mobile View Switcher (Only on screens < lg) -->
    <div class="lg:hidden bg-slate-100 p-1 rounded-2xl flex items-center gap-1 shadow-2xs">
      <button type="button" @click="activeMobileTab = 'preview'"
        class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
        :class="activeMobileTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
        <EyeIcon class="w-4 h-4 text-brand-primary" />
        <span>👁️ Ver Flyer</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary uppercase font-mono">
          {{formatOptions.find(f => f.id === selectedFormat)?.name.split(' ')[0]}}
        </span>
      </button>

      <button type="button" @click="activeMobileTab = 'controls'"
        class="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
        :class="activeMobileTab === 'controls' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
        <AdjustmentsHorizontalIcon class="w-4 h-4 text-purple-600" />
        <span>⚙️ Ajustes & Estilo</span>
      </button>
    </div>

    <!-- MAIN TWO-COLUMN RESPONSIVE LAYOUT -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

      <!-- ============================================== -->
      <!-- LEFT COLUMN: COMPACT ACCORDION CONTROLS        -->
      <!-- ============================================== -->
      <div class="lg:col-span-5 space-y-3.5" :class="activeMobileTab === 'controls' ? 'block' : 'hidden lg:block'">

        <!-- ACCORDION 1: FORMAT & CARTA SELECTION -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <button type="button" @click="toggleAccordion('format')"
            class="w-full px-4 py-3 bg-white hover:bg-slate-50/80 flex items-center justify-between border-b border-slate-100 transition-colors cursor-pointer">
            <div class="flex items-center gap-2 text-left">
              <span
                class="w-6 h-6 rounded-lg bg-orange-100 text-brand-primary flex items-center justify-center text-xs font-bold">1</span>
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Formato y Carta</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {{formatOptions.find(f => f.id === selectedFormat)?.name.split(' ')[0]}} • {{ currentCategory?.nombre
                }}
              </span>
              <component :is="accordions.format ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <div v-show="accordions.format" class="p-4 space-y-3">
            <!-- Format selector buttons -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Medio / Resolución:</label>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="opt in formatOptions" :key="opt.id" type="button" @click="selectedFormat = opt.id"
                  class="p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[52px]"
                  :class="selectedFormat === opt.id ? 'bg-orange-50/80 border-brand-primary ring-2 ring-brand-primary/10 shadow-2xs' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'">
                  <component :is="opt.icon" class="w-5 h-5"
                    :class="selectedFormat === opt.id ? 'text-brand-primary' : 'text-slate-500'" />
                  <span class="text-xs font-bold leading-tight"
                    :class="selectedFormat === opt.id ? 'text-brand-primary' : 'text-slate-700'">
                    {{ opt.id === 'whatsapp' ? 'WhatsApp' : opt.id === 'social' ? 'Redes 1:1' : 'TV 16:9' }}
                  </span>
                  <span class="text-[9px] font-mono text-slate-400 font-semibold">
                    {{ opt.id === 'whatsapp' ? '9:16' : opt.id === 'social' ? '1:1' : '16:9' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Image File Format Selector (PNG, JPG, JPEG) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[11px] font-bold text-slate-500 uppercase">Formato de Archivo:</label>
                <span class="text-[10px] font-bold text-brand-primary bg-orange-50 px-2 py-0.5 rounded border border-orange-200 uppercase font-mono">
                  .{{ selectedImageFormat }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="fmt in imageFormatOptions"
                  :key="fmt.id"
                  type="button"
                  @click="selectedImageFormat = fmt.id"
                  class="p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[52px]"
                  :class="selectedImageFormat === fmt.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold' : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 text-slate-700'"
                >
                  <span class="text-xs font-bold leading-tight">{{ fmt.name }}</span>
                  <span class="text-[9px] font-mono opacity-75">.{{ fmt.ext }}</span>
                  <span class="text-[8px] px-1.5 py-0.2 rounded mt-0.5 font-sans"
                    :class="selectedImageFormat === fmt.id ? 'bg-white/20 text-amber-300' : 'bg-slate-200/80 text-slate-600'">
                    {{ fmt.badge }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Category selector pills -->
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Carta para el flyer:</label>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="cat in mainCartas" :key="cat.id" type="button" @click="selectedCategoryId = cat.id"
                  class="p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer"
                  :class="selectedCategoryId === cat.id ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold' : 'bg-slate-50/60 text-slate-700 border-slate-200 hover:bg-slate-100'">
                  <component :is="getCategoryIcon(cat.nombre, cat.siempre_disponible)" class="w-4 h-4 shrink-0"
                    :class="selectedCategoryId === cat.id ? 'text-amber-300' : 'text-brand-primary'" />
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-bold truncate">{{ cat.nombre }}</div>
                    <div class="text-[10px] opacity-75 font-normal">
                      {{ getDishesForCategory(cat.id).length }} platos
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ACCORDION 2: PRICES & CONTENT VISIBILITY (Key User Request) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <button type="button" @click="toggleAccordion('content')"
            class="w-full px-4 py-3 bg-white hover:bg-slate-50/80 flex items-center justify-between border-b border-slate-100 transition-colors cursor-pointer">
            <div class="flex items-center gap-2 text-left">
              <span
                class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">2</span>
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Precios y Contenido</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded"
                :class="showPricesInFlyer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'">
                {{ showPricesInFlyer ? '💰 Precios Visibles' : 'Precios Ocultos' }}
              </span>
              <component :is="accordions.content ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <div v-show="accordions.content" class="p-4 space-y-3">
            <!-- Show/Hide Prices Main Toggle (Requested Requirement) -->
            <label class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer"
              :class="showPricesInFlyer ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200' : 'bg-slate-50 border-slate-200'">
              <div class="flex items-start gap-2.5 mr-2">
                <TagIcon class="w-5 h-5 shrink-0 mt-0.5"
                  :class="showPricesInFlyer ? 'text-emerald-600' : 'text-slate-400'" />
                <div>
                  <div class="text-xs font-bold text-slate-900">Mostrar precios en el flyer</div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {{ showPricesInFlyer
                      ? 'Los precios y líneas guía se muestran con alineación perfecta.'
                      : 'Oculta precios y líneas guía. Los nombres se expanden limpiamente sin huecos vacíos.' }}
                  </p>
                </div>
              </div>
              <input type="checkbox" v-model="showPricesInFlyer" class="toggle toggle-md toggle-success shrink-0" />
            </label>

            <!-- Show/Hide Descriptions Toggle -->
            <label
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer">
              <div class="flex items-start gap-2.5 mr-2">
                <DocumentTextIcon class="w-5 h-5 shrink-0 mt-0.5 text-brand-primary" />
                <div>
                  <div class="text-xs font-bold text-slate-900">Ver descripción de platos</div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Muestra ingredientes o detalles breves debajo de cada plato si el espacio lo permite.
                  </p>
                </div>
              </div>
              <input type="checkbox" v-model="showDescriptionsInFlyer"
                class="toggle toggle-sm toggle-primary shrink-0" />
            </label>

            <!-- Filter Availability Toggle -->
            <label
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-all cursor-pointer">
              <div class="flex items-start gap-2.5 mr-2">
                <CheckCircleIcon class="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <div class="text-xs font-bold text-slate-900">Filtrar solo platos disponibles</div>
                  <p class="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {{ showOnlyAvailableInFlyer
                      ? 'Mostrando únicamente platos con disponibilidad activa hoy.'
                      : 'Mostrando la carta completa con todos los platos registrados.' }}
                  </p>
                </div>
              </div>
              <input type="checkbox" v-model="showOnlyAvailableInFlyer"
                class="toggle toggle-sm toggle-primary shrink-0" />
            </label>

            <!-- Local Address Badge -->
            <div
              class="flex items-center gap-2 text-xs text-slate-600 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200">
              <MapPinIcon class="w-4 h-4 text-brand-primary shrink-0" />
              <div class="text-[11px]">
                Dirección en el pie: <strong class="text-slate-800">{{ businessAddress }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- ACCORDION 3: NOVEL AI DESIGN ENGINE (Logo, Fonts, Frame & Palettes) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <button type="button" @click="toggleAccordion('style')"
            class="w-full px-4 py-3 bg-white hover:bg-slate-50/80 flex items-center justify-between border-b border-slate-100 transition-colors cursor-pointer">
            <div class="flex items-center gap-2 text-left">
              <span
                class="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">3</span>
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Estilo del Día & IA</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                {{ currentStyle.name.split(' ')[0] }}
              </span>
              <component :is="accordions.style ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <div v-show="accordions.style" class="p-4 space-y-3.5">
            <!-- Randomizer Button -->
            <button type="button" @click="generateNovelDesignVariation"
              class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[44px]">
              <SparklesIcon class="w-4 h-4 text-amber-300 animate-spin" />
              <span>Generar Nuevo Diseño Aleatorio (IA)</span>
            </button>

            <!-- Logo Position Selector -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Posición del Logo:</label>
              <div class="grid grid-cols-4 gap-1.5">
                <button type="button" v-for="pos in (['center', 'left', 'right', 'badge'] as LogoPosition[])" :key="pos"
                  @click="selectedLogoPosition = pos"
                  class="py-1.5 px-1 rounded-lg text-xs font-medium text-center transition-all cursor-pointer"
                  :class="selectedLogoPosition === pos ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  {{ pos === 'center' ? 'Centro' : pos === 'left' ? 'Izq.' : pos === 'right' ? 'Der.' : 'Badge' }}
                </button>
              </div>
            </div>

            <!-- Typography Theme Selector -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Familia Tipográfica:</label>
              <div class="grid grid-cols-2 gap-1.5">
                <button type="button" @click="selectedFontTheme = 'serif'"
                  class="py-1.5 px-2 rounded-lg text-xs font-serif text-center transition-all cursor-pointer"
                  :class="selectedFontTheme === 'serif' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  Playfair Serif
                </button>
                <button type="button" @click="selectedFontTheme = 'sans'"
                  class="py-1.5 px-2 rounded-lg text-xs font-sans text-center transition-all cursor-pointer"
                  :class="selectedFontTheme === 'sans' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  Outfit Sans
                </button>
                <button type="button" @click="selectedFontTheme = 'condensed'"
                  class="py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer"
                  :class="selectedFontTheme === 'condensed' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  Bistró Impact
                </button>
                <button type="button" @click="selectedFontTheme = 'editorial'"
                  class="py-1.5 px-2 rounded-lg text-xs font-serif text-center transition-all cursor-pointer"
                  :class="selectedFontTheme === 'editorial' ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  Editorial
                </button>
              </div>
            </div>

            <!-- Typography Font Size Selector (Aumentar / Reducir Tamaño de Letra) -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-[11px] font-bold text-slate-600 uppercase">Tamaño de Letra:</label>
                <span
                  class="text-[11px] font-bold text-purple-700 font-mono bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                  {{ Math.round(flyerFontScale * 100) }}%
                </span>
              </div>

              <!-- Preset buttons -->
              <div class="grid grid-cols-4 gap-1.5 mb-2">
                <button v-for="preset in fontScalePresets" :key="preset.id" type="button"
                  @click="flyerFontScale = preset.scale"
                  class="py-1.5 px-1 rounded-lg text-xs font-medium text-center transition-all cursor-pointer"
                  :class="Math.abs(flyerFontScale - preset.scale) < 0.03 ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  <div class="font-bold">{{ preset.label }}</div>
                  <div class="text-[9px] opacity-75">{{ preset.pct }}</div>
                </button>
              </div>

              <!-- Stepper / Range Slider -->
              <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <button type="button" @click="adjustFontScale(-0.05)" :disabled="flyerFontScale <= 0.9"
                  class="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 disabled:opacity-40 cursor-pointer shadow-2xs"
                  title="Disminuir tamaño de letra">
                  A-
                </button>
                <input type="range" min="0.9" max="1.5" step="0.05" v-model.number="flyerFontScale"
                  class="range range-xs range-primary flex-1 cursor-pointer" />
                <button type="button" @click="adjustFontScale(0.05)" :disabled="flyerFontScale >= 1.5"
                  class="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 disabled:opacity-40 cursor-pointer shadow-2xs"
                  title="Aumentar tamaño de letra">
                  A+
                </button>
              </div>
            </div>

            <!-- Frame Style Selector -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1">Estilo de Marco:</label>
              <div class="grid grid-cols-2 gap-1.5">
                <button type="button" v-for="fr in ([
                  { id: 'double', label: 'Doble Clásico' },
                  { id: 'modern_cards', label: 'Tarjetas' },
                  { id: 'minimal_lines', label: 'Minimal' },
                  { id: 'ornamental', label: 'Ornamental' }
                ] as { id: FrameStyle; label: string }[])" :key="fr.id" @click="selectedFrameStyle = fr.id"
                  class="py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all cursor-pointer"
                  :class="selectedFrameStyle === fr.id ? 'bg-slate-900 text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                  {{ fr.label }}
                </button>
              </div>
            </div>

            <!-- Color Palette Selector -->
            <div>
              <label class="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">Paletas de Colores:</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button v-for="st in aiStyles" :key="st.id" type="button" @click="selectedAiStyleId = st.id"
                  class="p-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer"
                  :class="selectedAiStyleId === st.id ? 'border-purple-600 ring-2 ring-purple-100 bg-purple-50/40 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'">
                  <div class="min-w-0 pr-2">
                    <div class="text-[11px] font-bold text-slate-900 truncate">{{ st.name }}</div>
                    <span class="text-[9px] uppercase px-1 py-0.2 rounded"
                      :class="st.isDark ? 'bg-slate-900 text-amber-300 font-bold' : 'bg-orange-100 text-orange-800'">
                      {{ st.badge }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <span class="w-3 h-3 rounded-full border border-slate-300"
                      :style="{ backgroundColor: st.bgGrad[1] }"></span>
                    <span class="w-3 h-3 rounded-full border border-slate-300"
                      :style="{ backgroundColor: st.innerBorder }"></span>
                    <span class="w-3 h-3 rounded-full border border-slate-300"
                      :style="{ backgroundColor: st.priceColor }"></span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ACCORDION 4: DIRECT DOWNLOADS PER MEAL (Desayuno, Almuerzo, Cena, Bar) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <button type="button" @click="toggleAccordion('downloads')"
            class="w-full px-4 py-3 bg-white hover:bg-slate-50/80 flex items-center justify-between border-b border-slate-100 transition-colors cursor-pointer">
            <div class="flex items-center gap-2 text-left">
              <span
                class="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">4</span>
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Descargas Rápidas</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-mono text-slate-500">{{ mainCartas.length }} Cartas</span>
              <component :is="accordions.downloads ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <div v-show="accordions.downloads" class="p-3 space-y-2.5">
            <!-- Selector rápido de formato para descargas -->
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-100/90 border border-slate-200">
              <span class="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1.5">
                <PhotoIcon class="w-3.5 h-3.5 text-slate-500" />
                <span>Formato de descarga:</span>
              </span>
              <div class="inline-flex p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <button
                  v-for="fmt in imageFormatOptions"
                  :key="fmt.id"
                  type="button"
                  @click="selectedImageFormat = fmt.id"
                  class="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded transition-all cursor-pointer"
                  :class="selectedImageFormat === fmt.id ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                >
                  {{ fmt.name }}
                </button>
              </div>
            </div>

            <div v-for="cat in mainCartas" :key="cat.id"
              class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-colors">
              <div class="flex items-center gap-2 min-w-0 mr-2">
                <component :is="getCategoryIcon(cat.nombre, cat.siempre_disponible)"
                  class="w-4 h-4 text-brand-primary shrink-0" />
                <div class="truncate">
                  <span class="text-xs font-bold text-slate-900 block">{{ cat.nombre }}</span>
                  <span class="text-[10px] text-slate-500">
                    {{ getDishesForCategory(cat.id).length }} platos
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button type="button" @click="shareFlyerToWhatsApp(cat)"
                  :disabled="isSharingWhatsApp || downloadingCatId === cat.id"
                  class="btn btn-xs bg-[#25D366] hover:bg-[#20bd5a] text-white border-none rounded-lg flex items-center gap-1 cursor-pointer min-h-[36px]"
                  title="Compartir por WhatsApp">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span class="hidden sm:inline">WhatsApp</span>
                </button>

                <div class="inline-flex rounded-lg shadow-2xs overflow-hidden">
                  <button type="button" @click="downloadFlyerForCategory(cat)" :disabled="downloadingCatId === cat.id"
                    class="btn btn-xs bg-slate-900 hover:bg-slate-800 text-white rounded-r-none flex items-center gap-1 shrink-0 cursor-pointer min-h-[36px]"
                    :title="`Descargar flyer en formato ${selectedImageFormat.toUpperCase()} (.${selectedImageFormat})`">
                    <ArrowDownTrayIcon class="w-3.5 h-3.5 text-amber-300" />
                    <span>{{ downloadingCatId === cat.id ? '...' : selectedImageFormat.toUpperCase() }}</span>
                  </button>
                  <div class="dropdown dropdown-left dropdown-bottom">
                    <button tabindex="0" type="button"
                      class="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-l-none border-l border-slate-700 px-1 min-h-[36px] cursor-pointer"
                      title="Elegir formato para este flyer">
                      <ChevronDownIcon class="w-3 h-3" />
                    </button>
                    <ul tabindex="0" class="dropdown-content z-20 menu p-1.5 shadow-xl bg-slate-900 text-white border border-slate-700 rounded-xl w-36 space-y-0.5">
                      <li v-for="fmt in imageFormatOptions" :key="fmt.id">
                        <button type="button" @click="downloadFlyerForCategory(cat, fmt.id)"
                          class="text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                          :class="selectedImageFormat === fmt.id ? 'text-amber-300 font-bold' : 'text-slate-200'">
                          <span>.{{ fmt.ext }}</span>
                          <span class="text-[9px] opacity-60">{{ fmt.name }}</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile-Only Jump to Preview Button -->
        <div class="lg:hidden pt-2">
          <button type="button" @click="activeMobileTab = 'preview'"
            class="btn btn-primary w-full rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md min-h-[48px]">
            <EyeIcon class="w-5 h-5" />
            <span>Ver Resultado en el Flyer</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- RIGHT COLUMN: STICKY LIVE PREVIEW & DOWNLOAD   -->
      <!-- ============================================== -->
      <div class="lg:col-span-7 sticky top-4 space-y-3"
        :class="activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'">
        <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">

          <!-- Category Quick-Pills bar directly on top of preview -->
          <div class="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div class="flex items-center gap-1.5 shrink-0">
              <button v-for="cat in mainCartas" :key="cat.id" type="button" @click="selectedCategoryId = cat.id"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                :class="selectedCategoryId === cat.id ? 'bg-brand-primary text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
                <component :is="getCategoryIcon(cat.nombre, cat.siempre_disponible)" class="w-3.5 h-3.5" />
                <span>{{ cat.nombre }}</span>
              </button>
            </div>

            <!-- Quick Actions Group: Price Toggle & Instant Font Size Stepper -->
            <div class="flex items-center gap-1.5 shrink-0">
              <!-- Instant Price Toggle in Preview Header -->
              <button type="button" @click="showPricesInFlyer = !showPricesInFlyer"
                class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 border cursor-pointer min-h-[38px]"
                :class="showPricesInFlyer ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'"
                title="Cambiar visibilidad de precios">
                <TagIcon class="w-3.5 h-3.5" />
                <span>{{ showPricesInFlyer ? '💰 Con Precios' : 'Sin Precios' }}</span>
              </button>

              <!-- Instant Font Size Stepper in Preview Header -->
              <div class="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 shrink-0 min-h-[38px]"
                title="Ajustar tamaño de letra del flyer">
                <button type="button" @click="adjustFontScale(-0.10)" :disabled="flyerFontScale <= 0.9"
                  class="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-30 cursor-pointer transition-colors"
                  title="Reducir letra">
                  A-
                </button>
                <span class="px-1.5 text-[11px] font-bold text-purple-700 font-mono" title="Tamaño de letra actual">
                  {{ Math.round(flyerFontScale * 100) }}%
                </span>
                <button type="button" @click="adjustFontScale(0.10)" :disabled="flyerFontScale >= 1.5"
                  class="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-30 cursor-pointer transition-colors"
                  title="Aumentar letra">
                  A+
                </button>
              </div>
            </div>
          </div>

          <!-- Format & Style Metadata Badges -->
          <div
            class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="font-bold text-slate-800">
                {{ currentCategory?.nombre }}
              </span>
              <span class="badge badge-sm bg-slate-100 text-slate-700 font-mono text-[10px]">
                {{formatOptions.find(f => f.id === selectedFormat)?.name}} ({{formatOptions.find(f => f.id ===
                  selectedFormat)?.ratioText.split(' ')[1] }})
              </span>
              <span
                class="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                <SparklesIcon class="w-3 h-3 text-purple-600" />
                <span>{{ currentStyle.name }}</span>
              </span>
              <span class="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                Logo: {{ selectedLogoPosition }}
              </span>
              <span
                class="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-mono font-bold">
                Letra: {{ Math.round(flyerFontScale * 100) }}%
              </span>
              <span
                class="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                .{{ selectedImageFormat }}
              </span>
            </div>

            <!-- Format quick chips -->
            <div class="flex items-center gap-1">
              <button v-for="opt in formatOptions" :key="opt.id" type="button" @click="selectedFormat = opt.id"
                class="px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                :class="selectedFormat === opt.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                {{ opt.id === 'whatsapp' ? '9:16' : opt.id === 'social' ? '1:1' : '16:9' }}
              </button>
            </div>
          </div>

          <!-- Direct Prominent Actions: WhatsApp Sharing & Direct Download -->
          <div class="space-y-2.5" v-if="currentCategory">
            <!-- Selector de formato de archivo de descarga -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="flex items-center gap-1.5 text-xs text-slate-700 font-semibold pl-1">
                <PhotoIcon class="w-4 h-4 text-brand-primary shrink-0" />
                <span class="text-[11px] font-bold uppercase tracking-wider">Formato de descarga:</span>
              </div>
              <div class="inline-flex p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/60 self-start sm:self-auto">
                <button
                  v-for="fmt in imageFormatOptions"
                  :key="fmt.id"
                  type="button"
                  @click="selectedImageFormat = fmt.id"
                  class="px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  :class="selectedImageFormat === fmt.id ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
                  :title="fmt.desc"
                >
                  <span>{{ fmt.name }}</span>
                  <span class="text-[9px] font-mono opacity-60">.{{ fmt.ext }}</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <!-- Botón Compartir por WhatsApp -->
              <button
                type="button"
                @click="shareFlyerToWhatsApp(currentCategory)"
                :disabled="isSharingWhatsApp || downloadingCatId === currentCategory?.id"
                class="btn bg-[#25D366] hover:bg-[#20bd5a] text-white border-none rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 cursor-pointer min-h-[48px] text-xs sm:text-sm font-bold active:scale-[0.98] transition-all"
              >
                <span v-if="isSharingWhatsApp" class="loading loading-spinner loading-xs"></span>
                <svg v-else class="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{{ isSharingWhatsApp ? 'Preparando...' : 'Compartir por WhatsApp' }}</span>
              </button>

              <!-- Botón Descargar Imagen con menú desplegable -->
              <div class="flex items-stretch rounded-2xl shadow-md overflow-hidden bg-slate-900">
                <button
                  type="button"
                  @click="downloadFlyerForCategory(currentCategory)"
                  :disabled="isSharingWhatsApp || downloadingCatId === currentCategory?.id"
                  class="flex-1 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 cursor-pointer min-h-[48px] text-xs sm:text-sm font-bold active:scale-[0.98] transition-all"
                  :title="`Descargar flyer en formato ${selectedImageFormat.toUpperCase()} (.${selectedImageFormat})`"
                >
                  <ArrowDownTrayIcon class="w-4 h-4 text-amber-300" />
                  <span>
                    {{ downloadingCatId === currentCategory?.id ? 'Generando...' : `Descargar Flyer (${selectedImageFormat.toUpperCase()})` }}
                  </span>
                </button>

                <!-- Menú desplegable para descargar directamente en otro formato -->
                <div class="dropdown dropdown-top dropdown-end flex items-stretch">
                  <button
                    tabindex="0"
                    type="button"
                    class="px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-l border-slate-700/80 flex items-center justify-center cursor-pointer transition-colors"
                    title="Elegir formato de descarga (PNG, JPG, JPEG)"
                  >
                    <ChevronDownIcon class="w-4 h-4" />
                  </button>
                  <ul tabindex="0" class="dropdown-content z-30 menu p-2 shadow-2xl bg-slate-900 text-white border border-slate-700 rounded-2xl w-60 mb-2 space-y-1">
                    <li class="menu-title text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2 py-1">
                      Descargar directamente en:
                    </li>
                    <li v-for="fmt in imageFormatOptions" :key="fmt.id">
                      <button
                        type="button"
                        @click="downloadFlyerForCategory(currentCategory, fmt.id)"
                        class="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl hover:bg-slate-800 cursor-pointer"
                        :class="selectedImageFormat === fmt.id ? 'bg-slate-800/90 text-amber-300 font-bold' : 'text-slate-200'"
                      >
                        <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full" :class="selectedImageFormat === fmt.id ? 'bg-amber-400' : 'bg-slate-600'"></span>
                          <span>Descargar en <strong>{{ fmt.name }}</strong></span>
                        </div>
                        <span class="text-[10px] font-mono opacity-60">.{{ fmt.ext }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Previsualización del mensaje generado automáticamente para WhatsApp -->
            <div class="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3 text-xs text-slate-800 space-y-1.5 shadow-2xs">
              <div class="flex items-center justify-between font-bold text-emerald-900 text-[11px]">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Mensaje automático para acompañar el flyer:</span>
                </span>
                <button
                  type="button"
                  @click="copyWhatsAppMessage(currentCategory)"
                  class="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-950 font-bold underline text-[10px] cursor-pointer"
                  title="Copiar texto al portapapeles"
                >
                  <DocumentTextIcon class="w-3.5 h-3.5" />
                  <span>{{ copiedMessage ? '¡Texto copiado!' : 'Copiar texto' }}</span>
                </button>
              </div>
              <p class="whitespace-pre-line text-[11px] text-slate-700 bg-white/90 p-2.5 rounded-xl border border-emerald-100 font-sans leading-relaxed selection:bg-emerald-100">
                {{ getWhatsAppFlyerMessage(currentCategory) }}
              </p>
            </div>
          </div>

          <!-- Flyer Canvas Display Stage -->
          <div
            class="flex justify-center items-center bg-slate-900/5 p-3 sm:p-6 rounded-2xl border border-slate-200/90 min-h-[380px] overflow-hidden">
            <div v-if="isGenerating" class="flex flex-col items-center gap-3 text-slate-500 py-16">
              <span class="loading loading-spinner loading-lg text-brand-primary"></span>
              <p class="text-xs font-medium">Generando composición con IA...</p>
            </div>

            <div v-else-if="flyerPreviewUrl" class="w-full flex justify-center">
              <img :src="flyerPreviewUrl" :alt="`Flyer ${currentCategory?.nombre}`"
                class="rounded-xl shadow-xl max-h-[620px] w-auto max-w-full object-contain border border-slate-300/80 transition-all duration-300" />
            </div>

            <div v-else class="text-center py-12 text-slate-400">
              <PhotoIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p class="text-xs">Selecciona una carta para previsualizar el diseño.</p>
            </div>
          </div>

          <!-- Mobile Jump to Settings -->
          <div class="lg:hidden pt-1">
            <button type="button" @click="activeMobileTab = 'controls'"
              class="btn btn-outline btn-sm w-full rounded-xl flex items-center justify-center gap-1.5 text-xs text-slate-700 min-h-[44px]">
              <AdjustmentsHorizontalIcon class="w-4 h-4 text-purple-600" />
              <span>Personalizar Logo, Letras y Paleta de Colores</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
