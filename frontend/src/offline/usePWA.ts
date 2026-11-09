// Banda Digital Ecosystem - PWA & Service Worker Hook
import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface UsePWAResult {
  canInstall: boolean
  isInstalled: boolean
  hasUpdate: boolean
  isOnline: boolean
  installApp: () => Promise<boolean>
  updateApp: () => void
  checkForUpdate: () => Promise<void>
}

export function usePWA(): UsePWAResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    // 1. Check if already installed / standalone
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      if (isStandalone) {
        setIsInstalled(true)
      }
    }

    // 2. Listen to beforeinstallprompt event (Chromium-based browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setCanInstall(true)
      console.log('[Banda PWA] Event beforeinstallprompt terdeteksi. Tombol Pasang di HP siap ditampilkan.')
    }

    // 3. Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
      console.log('[Banda PWA] Aplikasi Banda Digital berhasil dipasang di perangkat pengguna.')
    }

    // 4. Online / Offline listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 5. Service Worker Update Detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return

        // Check if there is already a waiting worker
        if (reg.waiting) {
          setWaitingWorker(reg.waiting)
          setHasUpdate(true)
        }

        // Listen for new worker installed
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker)
              setHasUpdate(true)
              console.log('[Banda PWA] Versi baru aplikasi terunduh dan siap diaktifkan.')
            }
          })
        })
      })

      // When controller changes (SW activated), reload if triggered by user
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setIsInstalled(true)
        setCanInstall(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (err) {
      console.error('[Banda PWA] Gagal memicu dialog pemasangan aplikasi:', err)
      return false
    }
  }, [deferredPrompt])

  const updateApp = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    } else {
      window.location.reload()
    }
  }, [waitingWorker])

  const checkForUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          await reg.update()
        }
      } catch (err) {
        console.warn('[Banda PWA] Gagal memeriksa pembaruan service worker:', err)
      }
    }
  }, [])

  return {
    canInstall,
    isInstalled,
    hasUpdate,
    isOnline,
    installApp,
    updateApp,
    checkForUpdate,
  }
}
