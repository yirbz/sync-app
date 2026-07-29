"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Tv, Users, User } from "lucide-react"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/rooms", label: "Salas", icon: Users },
  { href: "/library", label: "Biblioteca", icon: Tv },
  { href: "/profile", label: "Perfil", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-[56px] bg-carbon border-t border-white/5 safe-area-inset-bottom">
      <div className="mx-auto flex h-full max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full rounded-[12px] transition-colors",
                isActive ? "text-escarlata" : "text-dim",
              )}
            >
              <Icon
                size={22}
                className={cn(
                  "transition-colors",
                  isActive ? "text-escarlata" : "text-dim",
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-medium leading-none transition-colors",
                  isActive ? "text-escarlata" : "text-muted",
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}