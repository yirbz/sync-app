"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-[64px] left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-carbon-2 rounded-[16px] p-4 shadow-elevated border border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-escarlata flex items-center justify-center shrink-0">
          <Download size={20} className="text-blanco-calido" />
        </div>
        <p className="flex-1 text-[13px] text-muted">
          Instala Sync para la experiencia completa
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShow(false)}
          >
            Ahora no
          </Button>
          <Button size="sm" onClick={handleInstall}>
            Instalar
          </Button>
        </div>
      </div>
    </div>
  )
}