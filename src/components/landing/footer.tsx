"use client"

import Link from "next/link"
import { SyncIcon } from "@/components/icons/sync-icon"

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-carbon text-blanco-calido pt-12 pb-10 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Brand Info with Official Sync Icon */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <SyncIcon size={38} variant="primary" />
            <div>
              <p className="text-[17px] font-bold tracking-tight text-blanco-calido">Sync</p>
              <p className="text-[12px] text-muted">Cine en casa entre amigos</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-muted">
            <Link href="/auth" className="hover:text-blanco-calido transition-colors">Crear sala</Link>
            <Link href="/rooms" className="hover:text-blanco-calido transition-colors">Mis salas</Link>
            <Link href="/library" className="hover:text-blanco-calido transition-colors">Jellyfin</Link>
            <a href="#how-it-works" className="hover:text-blanco-calido transition-colors">Cómo funciona</a>
          </div>
        </div>

        {/* Human Closing */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-dim">
          <p>© {new Date().getFullYear()} Sync · Hecho para compartir películas y buenos momentos.</p>
          <p>100% Privado · Sin anuncios</p>
        </div>
      </div>
    </footer>
  )
}
