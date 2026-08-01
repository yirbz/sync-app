import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"
import { SwRegistration } from "@/components/layout/sw-registration"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { InitialLoadingScreen } from "@/components/ui/initial-loading-screen"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sync-app.vercel.app"),
  title: "Sync — Cine en casa entre amigos",
  description: "Sesiones de video sincronizadas con amigos. Ve películas, series y streams de YouTube, Jellyfin y la web en perfecta sincronía.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Sync — Cine en casa entre amigos",
    description: "Sesiones de video sincronizadas con amigos. Ve películas, series y streams en perfecta sincronía.",
    url: "https://sync-app.vercel.app",
    siteName: "Sync",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sync — Cine en casa entre amigos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sync — Cine en casa entre amigos",
    description: "Sesiones de video sincronizadas con amigos. Ve películas, series y streams en perfecta sincronía.",
    images: ["/og-image.png"],
  },
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