"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { SyncIcon } from "@/components/icons/sync-icon"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Particles } from "@/components/magicui/particles"
import {
  LogOut, ShieldCheck, Smartphone, Monitor,
  Database, Check, Trash2, Zap, Server, User, Loader2
} from "lucide-react"

export default function ProfilePage() {
  const { session, signOut } = useAuth()
  const router = useRouter()

  const [pingStatus, setPingStatus] = useState<string | null>(null)
  const [pinging, setPinging] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [clearedCache, setClearedCache] = useState(false)

  useEffect(() => {
    const checkStandalone = () => {
      if (typeof window !== "undefined") {
        const standalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true
        setIsStandalone(standalone)
      }
    }
    const timer = setTimeout(checkStandalone, 0)
    return () => clearTimeout(timer)
  }, [])

  const testServerPing = async () => {
    if (!session?.serverUrl) return
    setPinging(true)
    const startTime = performance.now()
    try {
      const res = await fetch(`${session.serverUrl}/System/Info/Public`, { method: "GET" })
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      if (res.ok) {
        setPingStatus(`${duration}ms · Servidor respondiendo`)
      } else {
        setPingStatus(`Respuesta HTTP ${res.status}`)
      }
    } catch {
      setPingStatus("Error de red al contactar servidor")
    } finally {
      setPinging(false)
    }
  }

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sync_rooms")
      setClearedCache(true)
      setTimeout(() => setClearedCache(false), 2500)
    }
  }

  const handleLogout = () => {
    signOut()
    router.replace("/auth")
  }

  return (
    <div className="relative flex flex-col min-h-dvh bg-carbon text-blanco-calido pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(76px+env(safe-area-inset-bottom))] px-4 md:px-6 max-w-5xl mx-auto selection:bg-escarlata selection:text-white">
      <Particles quantity={20} color="#FF6B7A" className="opacity-40" />

      {/* Top Header */}
      <div className="py-4 flex items-center justify-between border-b border-white/5 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <SyncIcon size={38} variant="primary" className="rounded-[10px]" />
          <div>
            <h1 className="text-[20px] font-extrabold text-blanco-calido leading-tight">
              Perfil & Configuración
            </h1>
            <p className="text-[12px] text-muted">
              Diagnóstico técnico de tu sesión
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* User Card */}
        <div className="relative rounded-[26px] border border-white/10 bg-carbon-2/90 p-5 shadow-card overflow-hidden">
          <BorderBeam size={180} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-escarlata text-blanco-calido font-extrabold text-[20px] flex items-center justify-center shadow-md shrink-0">
              {session?.userName ? session.userName[0].toUpperCase() : <User size={24} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-extrabold text-blanco-calido truncate">
                  {session?.userName || "Usuario"}
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[12px] text-muted truncate">
                Sesión activa en Sync
              </p>
            </div>
          </div>
        </div>

        {/* Jellyfin Connection Diagnostics Card */}
        <section className="space-y-3">
          <h2 className="text-[15px] font-bold text-blanco-calido flex items-center gap-2">
            <Server size={16} className="text-escarlata" />
            <span>Servidor Jellyfin Vinculado</span>
          </h2>

          <div className="rounded-[24px] border border-white/10 bg-carbon-2/80 p-5 shadow-card space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-escarlata/15 text-escarlata flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-blanco-calido">
                    {session?.serverName || "Servidor Local"}
                  </h3>
                  <p className="text-[11.5px] font-mono text-dim truncate max-w-xs">
                    {session?.serverUrl || "No conectado"}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                En línea
              </span>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[12px] font-mono text-emerald-400">
                {pingStatus || "Haz clic para probar respuesta"}
              </span>

              <button
                type="button"
                onClick={testServerPing}
                disabled={pinging}
                className="px-3.5 py-1.5 rounded-full bg-carbon-3 hover:bg-carbon-2 text-blanco-calido text-[12px] font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                {pinging ? <Loader2 size={13} className="animate-spin text-coral" /> : <Zap size={13} className="text-coral" />}
                <span>{pinging ? "Probando..." : "Probar Latencia"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* System & PWA Diagnostic Status */}
        <section className="space-y-3">
          <h2 className="text-[15px] font-bold text-blanco-calido flex items-center gap-2">
            <Database size={16} className="text-coral" />
            <span>Diagnóstico del Sistema & Almacenamiento</span>
          </h2>

          <div className="rounded-[24px] border border-white/10 bg-carbon-2/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2.5">
                {isStandalone ? <Smartphone size={18} className="text-emerald-400" /> : <Monitor size={18} className="text-muted" />}
                <div>
                  <p className="font-semibold text-blanco-calido">Modo de Ejecución</p>
                  <p className="text-[11px] text-muted">
                    {isStandalone ? "Aplicación PWA instalada en pantalla de inicio" : "Navegador Web"}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-dim px-2.5 py-0.5 rounded-full bg-carbon-3">
                {isStandalone ? "PWA Standalone" : "Web Client"}
              </span>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-blanco-calido">Limpiar Caché Local de Salas</p>
                <p className="text-[11px] text-muted">Elimina la memoria temporal local de salas sin borrar tu sesión.</p>
              </div>

              <button
                type="button"
                onClick={handleClearCache}
                className="px-3.5 py-1.5 rounded-full bg-carbon-3 hover:bg-carbon-2 text-dim hover:text-white text-[12px] font-semibold border border-white/10 flex items-center gap-1.5 transition-colors shrink-0"
              >
                {clearedCache ? <Check size={14} className="text-emerald-400" /> : <Trash2 size={14} />}
                <span>{clearedCache ? "Limpio" : "Limpiar"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Log Out Section */}
        <section className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl bg-carbon-2 hover:bg-coral/10 text-coral border border-coral/20 text-[14px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <LogOut size={16} />
            <span>Cerrar sesión de Sync</span>
          </button>
        </section>
      </div>
    </div>
  )
}