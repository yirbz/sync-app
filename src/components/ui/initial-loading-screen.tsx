"use client"

import { useEffect, useState } from "react"
import { SyncLoader } from "@/components/ui/sync-loader"

export function InitialLoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setLoading(false), 350)
    }

    if (document.readyState === "complete") {
      handleLoad()
    } else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-carbon flex flex-col items-center justify-center transition-opacity duration-500 pointer-events-none ${
        loading ? "opacity-100 pointer-events-auto" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <SyncLoader size={96} text="Cargando Sync..." />
      </div>
    </div>
  )
}
