import { ref, computed } from 'vue'

const DISMISS_COOLDOWN_DAYS = 7
const DISMISS_KEY = 'pwa_prompt_dismissed_at'
const INSTALLED_KEY = 'pwa_installed'

// Singleton reactive state across the app
const deferredPrompt = ref<any>(null)
const isInstalled = ref<boolean>(false)
const isIOS = ref<boolean>(false)
const isInstallable = ref<boolean>(false)
const showPrompt = ref<boolean>(false)
const showIOSGuide = ref<boolean>(false)
let isInitialized = false
let triggerTimer: ReturnType<typeof setTimeout> | null = null

function checkIsInstalled(): boolean {
  if (typeof window === 'undefined') return false

  // 1. Standalone display mode (PWA window)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches

  // 2. iOS Safari standalone
  const isIOSStandalone = (window.navigator as any).standalone === true

  // 3. Android TWA / app referrer
  const isAndroidApp = typeof document !== 'undefined' && document.referrer?.includes('android-app://')

  // 4. Stored installation flag
  const storedInstalled = localStorage.getItem(INSTALLED_KEY) === 'true'

  return Boolean(isStandalone || isFullscreen || isMinimalUI || isIOSStandalone || isAndroidApp || storedInstalled)
}

function checkIsDismissed(): boolean {
  if (typeof window === 'undefined') return false
  const dismissedAtStr = localStorage.getItem(DISMISS_KEY)
  if (!dismissedAtStr) return false
  const dismissedAt = Number(dismissedAtStr)
  if (isNaN(dismissedAt)) return false
  const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  return (Date.now() - dismissedAt) < cooldownMs
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  const isAppleDevice = /iphone|ipad|ipod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  return isAppleDevice
}

function initPwaListeners() {
  if (typeof window === 'undefined' || isInitialized) return
  isInitialized = true

  isInstalled.value = checkIsInstalled()
  isIOS.value = checkIsIOS()

  // Escuchar evento de instalación del navegador (Android / Chrome / Edge / Desktop)
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevenir el banner feo nativo automático para controlarlo con nuestra UI personalizada
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true
  })

  // Escuchar cuando el usuario instala exitosamente la PWA
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    isInstallable.value = false
    showPrompt.value = false
    showIOSGuide.value = false
    deferredPrompt.value = null
    localStorage.setItem(INSTALLED_KEY, 'true')
  })
}

// Auto-inicializar listeners globales al importar el composable
if (typeof window !== 'undefined') {
  initPwaListeners()
}

export function usePwaInstall() {
  function evaluateEligibility(delayMs = 2000) {
    if (typeof window === 'undefined') return

    // Si ya está instalada, no mostrar
    if (checkIsInstalled()) {
      isInstalled.value = true
      showPrompt.value = false
      return
    }

    // Si el usuario eligió "Ahora no" recientemente, respetar cooldown
    if (checkIsDismissed()) {
      showPrompt.value = false
      return
    }

    // Si es iOS Safari (y no está instalada)
    if (checkIsIOS()) {
      isInstallable.value = true
      isIOS.value = true
      scheduleShow(delayMs)
      return
    }

    // Si tenemos el prompt de Chromium/Android disponible
    if (deferredPrompt.value) {
      isInstallable.value = true
      scheduleShow(delayMs)
    }
  }

  function scheduleShow(delayMs: number) {
    if (triggerTimer) clearTimeout(triggerTimer)
    triggerTimer = setTimeout(() => {
      if (!checkIsInstalled() && !checkIsDismissed()) {
        showPrompt.value = true
      }
    }, delayMs)
  }

  async function triggerInstall() {
    // Si tenemos el prompt nativo de Android / Chrome
    if (deferredPrompt.value) {
      try {
        await deferredPrompt.value.prompt()
        const choiceResult = await deferredPrompt.value.userChoice
        if (choiceResult && choiceResult.outcome === 'accepted') {
          isInstalled.value = true
          localStorage.setItem(INSTALLED_KEY, 'true')
          showPrompt.value = false
        } else {
          // El usuario canceló en el diálogo del sistema
          dismissPrompt()
        }
      } catch (err) {
        console.error('Error al invocar instalación PWA:', err)
      } finally {
        deferredPrompt.value = null
      }
      return
    }

    // Si es un dispositivo iOS, mostrar el paso a paso visual
    if (isIOS.value) {
      showIOSGuide.value = true
    }
  }

  function dismissPrompt() {
    showPrompt.value = false
    showIOSGuide.value = false
    if (triggerTimer) clearTimeout(triggerTimer)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  function closeIOSGuide() {
    showIOSGuide.value = false
    dismissPrompt()
  }

  // Permite resetear para pruebas si fuera necesario
  function resetDismissal() {
    localStorage.removeItem(DISMISS_KEY)
    localStorage.removeItem(INSTALLED_KEY)
    isInstalled.value = false
    evaluateEligibility(100)
  }

  return {
    isInstalled: computed(() => isInstalled.value),
    isInstallable: computed(() => isInstallable.value),
    isIOS: computed(() => isIOS.value),
    showPrompt: computed(() => showPrompt.value),
    showIOSGuide: computed(() => showIOSGuide.value),
    evaluateEligibility,
    triggerInstall,
    dismissPrompt,
    closeIOSGuide,
    resetDismissal
  }
}
