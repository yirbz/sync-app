"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { SyncIcon } from "@/components/icons/sync-icon"
import { RetroGrid } from "@/components/magicui/retro-grid"
import { Particles } from "@/components/magicui/particles"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { ShimmerButton } from "@/components/magicui/shimmer-button"

const DEFAULT_SERVER_URL = process.env.NEXT_PUBLIC_JELLYFIN_URL || "https://sync-app.duckdns.org"

export default function AuthPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setError("")
    setLoading(true)
    try {
      await signIn(DEFAULT_SERVER_URL, username.trim(), password)
      router.push("/home")
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { Message?: string } }; message?: string }
      setError(errorObj?.response?.data?.Message || errorObj?.message || "Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-carbon text-blanco-calido flex flex-col items-center justify-center px-4 py-12 selection:bg-escarlata selection:text-white overflow-hidden">
      {/* Magic UI Retro Grid & Embers */}
      <RetroGrid angle={65} />
      <Particles quantity={35} color="#FF6B7A" className="opacity-60" />

      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-escarlata/15 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Official Brand Header */}
        <BlurFade delay={0.1}>
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <SyncIcon size={46} variant="primary" className="group-hover:scale-105 transition-transform" />
              <div className="text-left">
                <h1 className="text-[26px] font-extrabold tracking-tight leading-none text-blanco-calido">Sync</h1>
                <span className="text-[11px] text-coral font-medium">Cine en casa</span>
              </div>
            </Link>
          </div>
        </BlurFade>

        {/* Login Card Container with Magic UI Border Beam */}
        <BlurFade delay={0.2}>
          <div className="relative rounded-[32px] border border-white/10 bg-carbon-2/90 p-6 sm:p-8 shadow-elevated backdrop-blur-xl space-y-6 overflow-hidden">
            <BorderBeam size={220} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />

            <div className="space-y-1 relative z-10">
              <h2 className="text-[20px] font-bold text-blanco-calido">Iniciar sesión</h2>
              <p className="text-[13px] text-muted">
                Ingresa tus credenciales para conectarte a la sala.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-muted pl-1">Usuario</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu nombre de usuario"
                    className="w-full rounded-[16px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[14px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata transition-colors"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-muted pl-1">Contraseña</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-[16px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[14px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata transition-colors"
                  />
                </div>
              </div>

              {/* Error Message Alert */}
              {error && (
                <div className="flex items-center gap-2 text-[13px] text-coral bg-coral/10 border border-coral/20 rounded-[14px] p-3">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Shimmer Button */}
              <ShimmerButton
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full py-3.5 rounded-full text-[14.5px] font-bold mt-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Conectando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Entrar a la sala</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </ShimmerButton>
            </form>

            <div className="pt-2 text-center border-t border-white/5 relative z-10">
              <Link href="/" className="text-[12px] text-dim hover:text-blanco-calido transition-colors">
                ← Volver a la página principal
              </Link>
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  )
}