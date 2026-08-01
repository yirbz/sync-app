"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { InteractiveRemoteDemo } from "@/components/landing/interactive-remote-demo"
import { ReactionSoundboard } from "@/components/landing/reaction-soundboard"
import { MediaHubDemo } from "@/components/landing/media-hub-demo"
import { CinemaTicketLauncher } from "@/components/landing/cinema-ticket-launcher"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if launched as PWA standalone app from Home Screen
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://")

      if (isStandalone) {
        router.replace("/auth?source=pwa")
      }
    }
  }, [router])

  return (
    <div className="bg-carbon text-blanco-calido min-h-screen selection:bg-escarlata selection:text-white">
      <Navbar />
      <Hero />
      <InteractiveRemoteDemo />
      <ReactionSoundboard />
      <MediaHubDemo />
      <CinemaTicketLauncher />
      <Footer />
    </div>
  )
}