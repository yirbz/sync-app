"use client"

import { useEffect } from "react"

export function SwRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return
    const handler = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {})
    }
    if (document.readyState === "complete") {
      handler()
    }
    window.addEventListener("load", handler)
    return () => window.removeEventListener("load", handler)
  }, [])

  return null
}