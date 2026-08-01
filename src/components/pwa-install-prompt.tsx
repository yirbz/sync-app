"use client"

import { PWAInstallElement } from "@khmyznikov/pwa-install"
import { useEffect, useRef, useState, useCallback } from "react"
import { SyncIcon } from "@/components/icons/sync-icon"

function isAndroid() {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent)
}

function isIOS() {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  return (
    /iPhone|iPad|iPod/.test(ua) ||
    (/Mac/.test(ua) && navigator.maxTouchPoints > 2)
  )
}

const DISMISS_KEY = "sync_pwa_banner_dismissed"
const BANNER_HEIGHT = 64

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill={i <= Math.floor(rating) ? "#f59e0b" : "none"}
          stroke="#f59e0b"
          strokeWidth="1"
        >
          <path d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.44L6 8.885 2.91 10.51l.59-3.44L1 4.635l3.455-.505z" />
        </svg>
      ))}
    </div>
  )
}

function AndroidManualSteps({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[99998] bg-black/60 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-[99999] animate-sheet-up"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#1F1113",
          color: "#FFF8F6",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          borderTop: "1px solid rgba(255, 248, 246, 0.1)",
          boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.5)",
          maxWidth: "414px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255, 248, 246, 0.2)" }}
          />
        </div>

        <div className="px-6 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <SyncIcon size={40} variant="primary" className="rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
            <div>
              <p className="text-[20px] font-bold text-blanco-calido leading-tight">
                Instalar Sync App
              </p>
              <p className="text-[12px] text-muted">
                Añade Sync a tu pantalla de inicio
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8 pt-2">
            <ManualStep
              icon={
                <svg height="22" viewBox="0 -960 960 960" width="22" fill="#E5283B">
                  <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
                </svg>
              }
              text="Toca el menú de tu navegador (⋮) en la esquina superior"
            />
            <ManualStep
              icon={
                <svg height="22" viewBox="0 -960 960 960" width="22" fill="#E5283B">
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              }
              text='Selecciona "Añadir a pantalla de inicio" o "Instalar aplicación"'
            />
            <ManualStep
              icon={
                <svg height="22" viewBox="0 -960 960 960" width="22" fill="#E5283B">
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                </svg>
              }
              text='Confirma tocando "Añadir"'
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-full text-[14px] font-bold transition-all bg-escarlata hover:bg-escarlata-2 text-blanco-calido active:scale-95 shadow-fab"
          >
            Entendido
          </button>
        </div>
      </div>
    </>
  )
}

function ManualStep({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-carbon-3 border border-white/5">
        {icon}
      </div>
      <p className="text-[13.5px] leading-snug text-blanco-calido/90">
        {text}
      </p>
    </div>
  )
}

type CustomPwaElement = PWAInstallElement & {
  isApple26Plus?: boolean
  isLiquidGlassSupported?: boolean
  icon?: string
  name?: string
  description?: string
}

export function PwaInstallPrompt() {
  const pwaRef = useRef<CustomPwaElement | null>(null)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showAndroidBar, setShowAndroidBar] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [showManualSteps, setShowManualSteps] = useState(false)

  const updateBannerState = useCallback((isOpen: boolean) => {
    if (typeof document !== "undefined") {
      if (isOpen) {
        document.documentElement.setAttribute("data-pwa-banner", "true")
        document.body.style.transition = "padding-top 0.35s cubic-bezier(0.22, 1, 0.36, 1)"
        document.body.style.paddingTop = `${BANNER_HEIGHT}px`
      } else {
        document.documentElement.removeAttribute("data-pwa-banner")
        document.body.style.paddingTop = ""
        document.body.style.transition = ""
      }
      window.dispatchEvent(new CustomEvent("pwa-banner-change", { detail: { open: isOpen } }))
    }
  }, [])

  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    setShowAndroidBar(false)
    setShowManualSteps(false)
    updateBannerState(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, "1")
    } catch {}
  }, [updateBannerState])

  const handleIOSInstall = useCallback(() => {
    const el = pwaRef.current
    if (!el) return

    try {
      el.icon = "/icons/icon-192.png"
      el.name = "Sync"
      el.description = "Cine en casa entre amigos"
      el.isAppleMobilePlatform = true
      el.isApple26Plus = true
      el.isLiquidGlassSupported = true
      el.showDialog(true)
    } catch (e) {
      console.error("[PWA] showDialog failed:", e)
    }
  }, [])

  const handleAndroidInstall = useCallback(async () => {
    const el = pwaRef.current

    if (el && deferredPromptRef.current) {
      try {
        el.icon = "/icons/icon-192.png"
        el.name = "Sync"
        el.description = "Cine en casa entre amigos"
        el.externalPromptEvent = deferredPromptRef.current
        await new Promise((r) => setTimeout(r, 350))
        el.showDialog(true)
      } catch (e) {
        console.error("[PWA] showDialog failed:", e)
      }
      return
    }

    if (deferredPromptRef.current) {
      try {
        deferredPromptRef.current.prompt()
        const { outcome } = await deferredPromptRef.current.userChoice
        if (outcome === "accepted") {
          setInstalled(true)
          handleDismiss()
        }
      } catch (e) {
        console.error("[PWA] native prompt failed:", e)
      }
      deferredPromptRef.current = null
      return
    }

    setShowAndroidBar(false)
    setShowManualSteps(true)
  }, [handleDismiss])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (installed) return

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (isStandalone) return

    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return
    } catch {}

    if (isIOS()) {
      if (!customElements.get("pwa-install")) {
        customElements.define("pwa-install", PWAInstallElement)
      }

      const el = document.createElement("pwa-install") as unknown as CustomPwaElement
      el.setAttribute("manifest-url", "/manifest.json")
      el.setAttribute("icon", "/icons/icon-192.png")
      el.setAttribute("name", "Sync")
      el.setAttribute("description", "Cine en casa entre amigos")
      el.setAttribute("manual-apple", "")
      el.setAttribute("styles", JSON.stringify({ "--tint-color": "#E5283B" }))
      document.body.appendChild(el)
      pwaRef.current = el

      const timer = setTimeout(() => {
        setShowBanner(true)
        updateBannerState(true)
      }, 1500)

      return () => {
        clearTimeout(timer)
        el.remove()
        pwaRef.current = null
        updateBannerState(false)
      }
    }

    if (isAndroid()) {
      const handler = (e: Event) => {
        e.preventDefault()
        deferredPromptRef.current = e as BeforeInstallPromptEvent

        const el = pwaRef.current
        if (el) {
          el.externalPromptEvent = e as BeforeInstallPromptEvent
        }
      }

      window.addEventListener("beforeinstallprompt", handler)

      if (!customElements.get("pwa-install")) {
        customElements.define("pwa-install", PWAInstallElement)
      }

      const el = document.createElement("pwa-install") as unknown as CustomPwaElement
      el.setAttribute("manifest-url", "/manifest.json")
      el.setAttribute("icon", "/icons/icon-192.png")
      el.setAttribute("name", "Sync")
      el.setAttribute("description", "Cine en casa entre amigos")
      el.setAttribute("manual-chrome", "")
      document.body.appendChild(el)
      pwaRef.current = el

      const timer = setTimeout(() => {
        setShowAndroidBar(true)
      }, 1500)

      return () => {
        clearTimeout(timer)
        window.removeEventListener("beforeinstallprompt", handler)
        el.remove()
        pwaRef.current = null
      }
    }
  }, [installed, updateBannerState])

  return (
    <>
      {/* iOS App Store Style Banner with Content Shift */}
      {isIOS() && showBanner && !installed && (
        <div
          className="fixed top-0 left-0 right-0 z-[99999] animate-slide-down"
          style={{
            height: BANNER_HEIGHT,
            background: "rgba(31, 17, 19, 0.94)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: "0.5px solid rgba(255, 248, 246, 0.12)",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-2 mx-auto max-w-lg h-full">
            <SyncIcon size={40} variant="primary" className="rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-bold truncate text-blanco-calido">
                  Sync
                </span>
                <Stars rating={5} />
              </div>
              <p className="text-[11px] leading-tight truncate mt-0.5 text-muted">
                Cine en casa entre amigos
              </p>
            </div>

            <button
              type="button"
              onClick={handleIOSInstall}
              className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold bg-escarlata hover:bg-escarlata-2 text-blanco-calido transition-transform active:scale-95 shadow-fab"
            >
              OBTENER
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-dim hover:text-blanco-calido"
              aria-label="Cerrar"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Android Play Store Style Bottom Sheet */}
      {isAndroid() && (
        <>
          <div
            className="fixed bottom-0 left-0 right-0 z-[99999] animate-android-bar"
            style={{
              background: "#1F1113",
              borderTop: "1px solid rgba(255, 248, 246, 0.1)",
              boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.4)",
              display: showAndroidBar && !installed ? "block" : "none",
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
              <SyncIcon size={40} variant="primary" className="rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold truncate text-blanco-calido">
                  Instalar Sync
                </p>
                <p className="text-[12px] truncate text-muted">
                  Cine en casa entre amigos
                </p>
              </div>

              <button
                type="button"
                onClick={handleAndroidInstall}
                className="shrink-0 px-5 py-2 rounded-full text-[13px] font-bold bg-escarlata hover:bg-escarlata-2 text-blanco-calido transition-transform active:scale-95 shadow-fab"
              >
                Instalar
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-dim hover:text-blanco-calido"
                aria-label="Cerrar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      <AndroidManualSteps
        open={showManualSteps}
        onClose={() => setShowManualSteps(false)}
      />

      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes android-bar-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-android-bar {
          animation: android-bar-up 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-sheet-up {
          animation: sheet-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </>
  )
}
