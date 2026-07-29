"use client"

import { useEffect } from "react"

export function SwRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          await navigator.serviceWorker.register("/sw.js", { scope: "/" })
        } catch {
          // SW registration is non-critical
        }
      })
    }
  }, [])

  return null
}