"use client"

import { usePathname } from "next/navigation"
import { AuthProvider } from "@/hooks/use-auth"
import { AuthGuard } from "./auth-guard"
import { BottomNav } from "./bottom-nav"
import { InstallPrompt } from "./install-prompt"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isInsideRoom = pathname ? pathname.startsWith("/rooms/") && pathname !== "/rooms" : false
  const isLanding = pathname === "/"
  const isAuth = pathname === "/auth"
  const hideBottomNav = isInsideRoom || isLanding || isAuth

  return (
    <AuthProvider>
      <AuthGuard>
        <main className={isInsideRoom ? "w-full h-dvh max-h-dvh flex flex-col overflow-hidden relative" : hideBottomNav ? "flex-1 min-h-dvh" : "flex-1 pb-[calc(68px+env(safe-area-inset-bottom,0px))] min-h-dvh"}>
          {children}
        </main>
        {!hideBottomNav && <BottomNav />}
        <InstallPrompt />
      </AuthGuard>
    </AuthProvider>
  )
}