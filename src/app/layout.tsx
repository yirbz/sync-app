import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"
import { SwRegistration } from "@/components/layout/sw-registration"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { InitialLoadingScreen } from "@/components/ui/initial-loading-screen"

export const metadata: Metadata = {
  title: "Sync — Cine en casa entre amigos",
  description: "Sesiones de video sincronizadas con amigos. Ve películas, series y streams de YouTube y Jellyfin en perfecta sincronía.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sync",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#140A0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-carbon text-blanco-calido font-sans flex flex-col">
        <InitialLoadingScreen />
        <AppShell>
          {children}
        </AppShell>
        <PwaInstallPrompt />
        <SwRegistration />
      </body>
    </html>
  )
}