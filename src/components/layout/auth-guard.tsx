"use client"

import { useAuth } from "@/hooks/use-auth"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

const PUBLIC_ROUTES = ["/", "/auth"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    function handleExpired() {
      router.replace("/auth?expired=true")
    }

    window.addEventListener("sync_session_expired", handleExpired)
    return () => window.removeEventListener("sync_session_expired", handleExpired)
  }, [router])

  useEffect(() => {
    if (loading) return

    const isPublic = pathname === "/" || PUBLIC_ROUTES.some((r) => pathname.startsWith(r))
    const isJoin = pathname.startsWith("/rooms/join")

    if (!isAuthenticated && !isPublic && !isJoin) {
      router.replace("/auth")
    }

    if (isAuthenticated && pathname === "/auth") {
      router.replace("/home")
    }
  }, [isAuthenticated, loading, pathname, router])

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-pulse text-dim text-[15px]">Cargando...</div>
      </div>
    )
  }

  return <>{children}</>
}