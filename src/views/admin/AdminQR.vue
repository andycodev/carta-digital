<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'
import { useMenuStore } from '@/composables/useMenuStore'
import logoImg from '@/assets/las-delicias-logo.png'
import {
  PrinterIcon,
  ArrowDownTrayIcon,
  QrCodeIcon,
  GlobeAltIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  SparklesIcon,
  BuildingStorefrontIcon
} from '@heroicons/vue/24/outline'

const { config } = useMenuStore()

const selectedQrTarget = ref<'main' | 'bar'>('main')
const qrDataUrl = ref<string>('')
const isCopied = ref(false)

function getPublicCartaUrl(): string {
  if (selectedQrTarget.value === 'bar') {
    return `${window.location.origin}/bar`
  }
  return `${window.location.origin}/`
}

function handleSwitchTarget(target: 'main' | 'bar') {
  selectedQrTarget.value = target
  generatePublicQR()
}

async function generatePublicQR() {
  await nextTick()
  const publicUrl = getPublicCartaUrl()

  try {
    qrDataUrl.value = await QRCode.toDataURL(publicUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })
  } catch (err) {
    console.error('Error generating QR:', err)
  }
}

async function copyPublicUrl() {
  try {
    await navigator.clipboard.writeText(getPublicCartaUrl())
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  } catch (err) {
    console.warn('Could not copy automatically:', err)
  }
}

// Download Standalone QR Image (Square 1000x1000 PNG)
async function downloadStandaloneQR() {
  try {
    const publicUrl = getPublicCartaUrl()
    const highResQR = await QRCode.toDataURL(publicUrl, {
      width: 1000,
      margin: 3,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })

    const filename = selectedQrTarget.value === 'bar'
      ? 'QR-Bar-Las-Delicias.png'
      : 'QR-Oficial-Las-Delicias.png'

    const link = document.createElement('a')
    link.setAttribute('download', filename)
    link.href = highResQR
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Error downloading standalone QR:', err)
  }
}

// Helper to load logo for branded card
function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Logo could not load'))
    img.src = logoImg
  })
}

// Generate Printable Card Canvas (1200 x 1800 px) for local display
async function downloadPrintableDisplayCard() {
  try {
    const publicUrl = getPublicCartaUrl()
    const isBar = selectedQrTarget.value === 'bar'

    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1800
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Background (warm premium gradient)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1800)
    bgGrad.addColorStop(0, '#0F172A')
    bgGrad.addColorStop(0.35, '#1E293B')
    bgGrad.addColorStop(1, '#090D16')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, 1200, 1800)

    // 2. Ornamental Borders
    ctx.strokeStyle = '#D97706'
    ctx.lineWidth = 4
    ctx.strokeRect(40, 40, 1120, 1720)

    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 1.5
    ctx.strokeRect(55, 55, 1090, 1690)

    // Corner accents
    for (const [cx, cy] of [[55, 55], [1145, 55], [55, 1745], [1145, 1745]]) {
      ctx.fillStyle = '#F59E0B'
      ctx.fillRect(cx - 6, cy - 6, 12, 12)
    }

    // 3. Logo
    try {
      const logo = await loadLogo()
      const logoW = 320
      const logoH = (logo.naturalHeight / logo.naturalWidth) * logoW
      ctx.drawImage(logo, (1200 - logoW) / 2, 110, logoW, logoH)
    } catch {
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 50px "Playfair Display", Georgia, serif'
      ctx.textAlign = 'center'
      ctx.fillText('LAS DELICIAS', 600, 190)
    }

    // 4. Restaurant Titles
    ctx.textAlign = 'center'
    ctx.fillStyle = '#F59E0B'
    ctx.font = 'bold 26px "Inter", sans-serif'
    ctx.fillText('RESTOBAR & COCTELERÍA', 600, 310)

    ctx.fillStyle = '#94A3B8'
    ctx.font = 'italic 24px "Playfair Display", serif'
    ctx.fillText(config.value.subtitulo || 'Sabor, música y buenos momentos', 600, 355)

    // 5. Card Identifier Banner
    ctx.fillStyle = isBar ? '#C2410C' : '#D97706'
    ctx.beginPath()
    ctx.roundRect(240, 405, 720, 80, 20)
    ctx.fill()

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '900 36px "Inter", sans-serif'
    ctx.fillText(isBar ? 'CARTA DE BAR & BEBIDAS' : 'CARTA DIGITAL OFICIAL', 600, 458)

    // 6. QR Code High-Res
    const qrImage = await QRCode.toDataURL(publicUrl, {
      width: 700,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })

    const qrImgEl = new Image()
    qrImgEl.src = qrImage
    await new Promise(r => { qrImgEl.onload = r })

    // QR White Container Box
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.roundRect(250, 540, 700, 700, 36)
    ctx.fill()
    ctx.drawImage(qrImgEl, 275, 565, 650, 650)

    // 7. Scanning instructions
    ctx.fillStyle = '#F8FAFC'
    ctx.font = 'bold 44px "Inter", sans-serif'
    ctx.fillText('ESCANEA CON TU CELULAR', 600, 1330)

    ctx.fillStyle = '#CBD5E1'
    ctx.font = '26px "Inter", sans-serif'
    ctx.fillText('Abre la cámara de tu smartphone para ver la carta en vivo', 600, 1380)

    ctx.fillStyle = '#64748B'
    ctx.font = '22px "Inter", sans-serif'
    ctx.fillText('Sin necesidad de instalar ninguna aplicación', 600, 1420)

    // 8. Public Link Footer Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
    ctx.beginPath()
    ctx.roundRect(200, 1490, 800, 85, 20)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.stroke()

    ctx.fillStyle = '#F59E0B'
    ctx.font = 'bold 28px monospace'
    ctx.fillText(publicUrl, 600, 1544)

    // 9. Copyright footer
    ctx.fillStyle = '#475569'
    ctx.font = '20px "Inter", sans-serif'
    ctx.fillText('Las Delicias Restobar • Calle Santa Catalina 1401 - Chongoyape', 600, 1690)

    // Download triggered
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    const filename = isBar
      ? 'Ficha-QR-Bar-Las-Delicias.png'
      : 'Ficha-QR-Carta-Las-Delicias.png'

    link.setAttribute('download', filename)
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Error rendering printable card:', err)
  }
}

function printCard() {
  window.print()
}

onMounted(() => {
  generatePublicQR()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Códigos QR de las Cartas Públicas</h2>
        <p class="text-xs text-slate-500">
          Descarga los códigos QR oficiales para el salón, barras, caja y publicidad del local.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" @click="downloadStandaloneQR"
          class="btn btn-sm bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>Descargar Imagen QR (.PNG)</span>
        </button>

        <button type="button" @click="downloadPrintableDisplayCard"
          class="btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
          <SparklesIcon class="w-4 h-4" />
          <span>Descargar Ficha Imprimible</span>
        </button>

        <button type="button" @click="printCard"
          class="btn btn-sm btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
          <PrinterIcon class="w-4 h-4" />
          <span>Imprimir</span>
        </button>
      </div>
    </div>

    <!-- Selector de Destino del QR (Carta Principal vs Carta del Bar) -->
    <div
      class="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
      <div class="flex items-center gap-1 w-full sm:w-auto">
        <button type="button" @click="handleSwitchTarget('main')"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="selectedQrTarget === 'main' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'">
          <BuildingStorefrontIcon class="w-4 h-4" />
          <span>QR Carta Principal (Cocina / Salón)</span>
        </button>

        <button type="button" @click="handleSwitchTarget('bar')"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="selectedQrTarget === 'bar' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'">
          <SparklesIcon class="w-4 h-4" />
          <span>QR Exclusivo del Bar (/bar)</span>
        </button>
      </div>

      <span class="text-[11px] text-slate-500 font-mono px-3">
        URL de destino: <strong class="text-slate-800">{{ getPublicCartaUrl() }}</strong>
      </span>
    </div>

    <!-- Main QR Card Container -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left / Center: Official QR Card Preview -->
      <div class="lg:col-span-7 flex flex-col items-center">
        <div
          class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg max-w-md w-full text-center space-y-5 print:border-none print:shadow-none">
          <!-- Business identity -->
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-brand-primary">
              {{ config.subtitulo || 'Sabor, música y buenos momentos' }}
            </span>
            <h1 class="text-2xl font-black text-slate-900 mt-1">
              LAS DELICIAS RESTOBAR
            </h1>
            <p class="text-xs text-slate-500 mt-0.5">
              Carta Digital Interactiva
            </p>
          </div>

          <!-- QR Code Container -->
          <div class="p-4 bg-slate-50 rounded-3xl border border-slate-200/80 inline-block shadow-inner mx-auto">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Oficial Las Delicias"
              class="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto" />
            <div v-else class="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-xs text-slate-400">
              <QrCodeIcon class="w-12 h-12 text-slate-300 animate-pulse" />
            </div>
          </div>

          <!-- Instructions -->
          <div class="space-y-1">
            <p class="text-sm font-bold text-slate-800">
              Escanea con la cámara de tu celular
            </p>
            <p class="text-xs text-slate-500">
              Accede al menú actualizado en vivo, precios y promociones
            </p>
          </div>

          <!-- Clean URL Display with Copy button -->
          <div
            class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs no-print">
            <div class="flex items-center gap-2 min-w-0">
              <GlobeAltIcon class="w-4 h-4 text-brand-primary shrink-0" />
              <span class="font-mono text-slate-700 truncate font-semibold">
                {{ getPublicCartaUrl() }}
              </span>
            </div>

            <button type="button" @click="copyPublicUrl"
              class="btn btn-xs rounded-lg flex items-center gap-1 shrink-0 transition-all cursor-pointer"
              :class="isCopied ? 'btn-success text-white' : 'btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white'">
              <component :is="isCopied ? CheckIcon : ClipboardDocumentIcon" class="w-3.5 h-3.5" />
              <span>{{ isCopied ? '¡Copiado!' : 'Copiar URL' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Technical Details and Guidance -->
      <div class="lg:col-span-5 space-y-4 no-print">
        <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
            <QrCodeIcon class="w-5 h-5 text-brand-primary" />
            <span>Ventajas del QR Público Único</span>
          </h3>

          <ul class="space-y-3 text-slate-600">
            <li class="flex items-start gap-2.5">
              <span
                class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><strong>Impresión Unificada:</strong> Puedes imprimir un único diseño de código QR para todo el
                local, barras, caja y publicidad sin confusiones.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span
                class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><strong>Enlace Público Limpio:</strong> Los clientes acceden a la dirección raíz oficial <code
                  class="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-800">{{ getPublicCartaUrl() }}</code>
                de forma directa, rápida y sin parámetros.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span
                class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><strong>Actualización en Vivo:</strong> Cualquier cambio en platos, bebidas, horarios o precios se
                refleja inmediatamente en el menú que el cliente visualiza.</span>
            </li>
          </ul>

          <div class="pt-3 border-t border-slate-100 space-y-2">
            <button type="button" @click="downloadPrintableDisplayCard"
              class="btn btn-sm w-full bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
              <ArrowDownTrayIcon class="w-4 h-4" />
              <span>Descargar Ficha Imprimible para Salón / Barra (PNG Alta Calidad)</span>
            </button>
            <button type="button" @click="downloadStandaloneQR"
              class="btn btn-sm w-full btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <QrCodeIcon class="w-4 h-4" />
              <span>Descargar Solo Código QR (PNG 1000x1000)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
