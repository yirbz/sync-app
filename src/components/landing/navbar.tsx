"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { SyncIcon } from "@/components/icons/sync-icon"
import { BorderBeam } from "@/components/magicui/border-beam"
import { ShimmerButton } from "@/components/magicui/shimmer-button"

export function Navbar() {
  const [hasPwaBanner, setHasPwaBanner] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const checkBanner = () => {
      const isBannerActive = document.documentElement.getAttribute("data-pwa-banner") === "true"
      setHasPwaBanner(isBannerActive)
    }

    checkBanner()

    const handleCustomEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ open?: boolean }>
      if (typeof customEvt.detail?.open === "boolean") {
        setHasPwaBanner(customEvt.detail.open)
      } else {
        checkBanner()
      }
    }

    window.addEventListener("pwa-banner-change", handleCustomEvent)
    return () => {
      window.removeEventListener("pwa-banner-change", handleCustomEvent)
    }
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 z-50 px-4 py-3 md:px-6 transition-all duration-300 ease-out ${
        hasPwaBanner
          ? "top-[64px] opacity-0 pointer-events-none -translate-y-4"
          : "top-0 opacity-100 translate-y-0"
      }`}
    >
      <div className="relative mx-auto max-w-5xl rounded-full border border-white/10 bg-carbon-2/90 backdrop-blur-xl px-5 py-2.5 shadow-elevated flex items-center justify-between overflow-hidden">
        {/* Magic UI Border Beam */}
        <BorderBeam size={180} duration={10} colorFrom="#E5283B" colorTo="#FF6B7A" />

        {/* Official Sync Brand Icon */}
        <Link href="/landing" className="flex items-center gap-2.5 text-blanco-calido group focus-visible:ring-2 focus-visible:ring-escarlata rounded-full relative z-10">
          <SyncIcon size={34} variant="primary" className="group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="text-[18px] font-bold tracking-tight text-blanco-calido">Sync</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-carbon-3 text-coral font-medium border border-white/5">
              Cine en casa
            </span>
          </div>
        </Link>

        {/* Status & Quick Actions */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-3 text-[12px] text-muted border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Listo para transmitir</span>
          </div>

          <Link href="/auth">
            <ShimmerButton className="text-[13px] px-4 py-2 flex items-center gap-1.5">
              <Plus size={15} />
              <span>Crear sala</span>
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </header>
  )
}
