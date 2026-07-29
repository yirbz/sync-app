"use client"

import { AuthProvider } from "@/hooks/use-auth"
import { AuthGuard } from "./auth-guard"
import { BottomNav } from "./bottom-nav"
import { InstallPrompt } from "./install-prompt"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <main className="flex-1 pb-[56px]">
          {children}
        </main>
        <BottomNav />
        <InstallPrompt />
      </AuthGuard>
    </AuthProvider>
  )
}