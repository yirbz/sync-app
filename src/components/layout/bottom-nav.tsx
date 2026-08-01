"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Tv, User } from "lucide-react"

const navItems = [
  { href: "/home", label: "Inicio", icon: Home },
  { href: "/rooms", label: "Salas", icon: Users },
  { href: "/library", label: "Biblioteca", icon: Tv },
  { href: "/profile", label: "Perfil", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-carbon-2/95 backdrop-blur-md border-t border-white/5 pb-[env(safe-area-inset-bottom,0px)] pt-1.5 px-3">
      <div className="mx-auto flex h-[52px] max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/rooms" && pathname.startsWith("/rooms"))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] py-1 rounded-[12px] transition-all",
                isActive ? "text-escarlata" : "text-dim hover:text-muted"
              )}
            >
              <Icon
                size={20}
                className={cn("transition-transform duration-200", isActive ? "text-escarlata scale-110" : "text-dim")}
              />
              <span className={cn("text-[10px] font-medium leading-none transition-colors", isActive ? "text-escarlata font-bold" : "text-dim")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}