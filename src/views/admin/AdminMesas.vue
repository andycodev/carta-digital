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
    if (img.complete && img.naturalWidth > 0) resolve(img)
  })
}

// Download Branded Table Card for acrylic stand (1200 x 1600 px high quality PNG)
async function downloadPrintableTableCard() {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 1600
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 1. Clean Luxury Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1600)
  bgGrad.addColorStop(0, '#FFFFFF')
  bgGrad.addColorStop(1, '#F8FAFC')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1200, 1600)

  // Outer border
  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 8
  ctx.strokeRect(40, 40, 1120, 1520)

  // Inner copper/terracotta frame
  ctx.strokeStyle = '#C2410C'
  ctx.lineWidth = 4
  ctx.strokeRect(60, 60, 1080, 1480)

  // 2. Logo
  let currentY = 120
  try {
    const logo = await loadLogo()
    const logoW = 380
    const ratio = logo.naturalHeight / (logo.naturalWidth || 1)
    const logoH = logoW * ratio
    ctx.drawImage(logo, (1200 - logoW) / 2, currentY, logoW, logoH)
    currentY += logoH + 40
  } catch {
    ctx.fillStyle = '#0F172A'
    ctx.font = 'bold 50px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('LAS DELICIAS RESTOBAR', 600, currentY + 60)
    currentY += 120
  }

  // Slogan
  ctx.fillStyle = '#C2410C'
  ctx.font = 'bold 30px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(config.value.subtitulo || 'Sabor, música y buenos momentos', 600, currentY)

  currentY += 60

  // Title
  ctx.fillStyle = '#0F172A'
  ctx.font = 'bold 54px sans-serif'
  ctx.fillText('CARTA DIGITAL INTERACTIVA', 600, currentY)

  currentY += 30

  // Divider
  ctx.beginPath()
  ctx.moveTo(250, currentY)
  ctx.lineTo(950, currentY)
  ctx.strokeStyle = '#CBD5E1'
  ctx.lineWidth = 3
  ctx.stroke()

  currentY += 50

  // High-Res QR Code in center
  const publicUrl = getPublicCartaUrl()
  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, publicUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF'
    }
  })

  ctx.drawImage(qrCanvas, 300, currentY, 600, 600)

  currentY += 650

  // Instruction
  ctx.fillStyle = '#1E293B'
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText('Escanea con la cámara de tu celular', 600, currentY)

  currentY += 45
  ctx.fillStyle = '#64748B'
  ctx.font = '26px sans-serif'
  ctx.fillText('Consulta los platos, bebidas y precios del día en vivo', 600, currentY)

  currentY += 55
  ctx.fillStyle = '#C2410C'
  ctx.font = 'bold 26px monospace'
  ctx.fillText(publicUrl, 600, currentY)

  // Trigger download with direct dataURL
  const dataUri = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.setAttribute('download', selectedQrTarget.value === 'bar' ? 'Ficha-QR-Bar-Las-Delicias.png' : 'Ficha-QR-Carta-Las-Delicias.png')
  link.href = dataUri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Códigos QR de las Cartas Públicas</h2>
        <p class="text-xs text-slate-500">
          Descarga los códigos QR oficiales para imprimir en acrílicos de mesa, barras, caja y publicidad.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          @click="downloadStandaloneQR"
          class="btn btn-sm bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          <span>Descargar Imagen QR (.PNG)</span>
        </button>

        <button
          type="button"
          @click="downloadPrintableTableCard"
          class="btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
        >
          <SparklesIcon class="w-4 h-4" />
          <span>Descargar Ficha Imprimible</span>
        </button>

        <button
          type="button"
          @click="printCard"
          class="btn btn-sm btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center gap-1.5"
        >
          <PrinterIcon class="w-4 h-4" />
          <span>Imprimir</span>
        </button>
      </div>
    </div>

    <!-- Selector de Destino del QR (Carta Principal vs Carta del Bar) -->
    <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
      <div class="flex items-center gap-1 w-full sm:w-auto">
        <button
          type="button"
          @click="handleSwitchTarget('main')"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="selectedQrTarget === 'main' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
        >
          <BuildingStorefrontIcon class="w-4 h-4" />
          <span>QR Carta Principal (Cocina / Salón)</span>
        </button>

        <button
          type="button"
          @click="handleSwitchTarget('bar')"
          class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          :class="selectedQrTarget === 'bar' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
        >
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
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-lg max-w-md w-full text-center space-y-5 print:border-none print:shadow-none">
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
            <img
              v-if="qrDataUrl"
              :src="qrDataUrl"
              alt="QR Oficial Las Delicias"
              class="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
            />
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
          <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs no-print">
            <div class="flex items-center gap-2 min-w-0">
              <GlobeAltIcon class="w-4 h-4 text-brand-primary shrink-0" />
              <span class="font-mono text-slate-700 truncate font-semibold">
                {{ getPublicCartaUrl() }}
              </span>
            </div>

            <button
              type="button"
              @click="copyPublicUrl"
              class="btn btn-xs rounded-lg flex items-center gap-1 shrink-0 transition-all"
              :class="isCopied ? 'btn-success text-white' : 'btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white'"
            >
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
              <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><strong>Impresión Unificada:</strong> Puedes imprimir un único diseño de código QR para todas las mesas del local, barra y cajas sin riesgo de confusión.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><strong>Enlace Público Limpio:</strong> Los clientes acceden a la dirección raíz <code class="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-800">{{ getPublicCartaUrl() }}</code> sin parámetros visibles que alteren la experiencia.</span>
            </li>
            <li class="flex items-start gap-2.5">
              <span class="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
              <span><strong>Preparado para el Futuro:</strong> Cuando desees implementar pedidos o llamados por mesa individual, el sistema reactivará de forma transparente los identificadores específicos.</span>
            </li>
          </ul>

          <div class="pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              @click="downloadPrintableTableCard"
              class="btn btn-sm w-full bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
              <span>Descargar Ficha Imprimible para Salón / Barra (PNG Alta Calidad)</span>
            </button>
            <button
              type="button"
              @click="downloadStandaloneQR"
              class="btn btn-sm w-full btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <QrCodeIcon class="w-4 h-4" />
              <span>Descargar Solo Código QR (PNG 1000x1000)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
