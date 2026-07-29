"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { SyncIcon } from "@/components/icons/sync-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Server, User, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [serverUrl, setServerUrl] = useState("https://sync-app.duckdns.org")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signIn(serverUrl, username, password)
      router.push("/")
    } catch (err: any) {
      setError(err?.response?.data?.Message || err?.message || "Error al conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-16">
      <SyncIcon variant="primary" size={72} className="mb-6" />
      <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-blanco-calido mb-1">
        Sync
      </h1>
      <p className="text-[15px] text-muted mb-8">Conecta con tu servidor Jellyfin</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="relative">
          <Server size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="https://tuserver.com"
            className="w-full rounded-[14px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[15px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
            required
          />
        </div>

        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Usuario"
            className="w-full rounded-[14px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[15px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
            required
          />
        </div>

        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-[14px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[15px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[13px] text-coral bg-coral/10 rounded-[12px] px-3 py-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <ArrowRight size={18} className="mr-2" />}
          {loading ? "Conectando..." : "Entrar"}
        </Button>
      </form>
    </div>
  )
}