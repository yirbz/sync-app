"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Header } from "@/components/layout/header"
import { SyncIcon } from "@/components/icons/sync-icon"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Settings, LogOut, Link, CheckCircle, XCircle } from "lucide-react"

export default function ProfilePage() {
  const { session, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    signOut()
    router.push("/auth")
  }

  return (
    <div className="pt-[72px] px-4 pb-4">
      <Header title="Perfil" action={
        <Button variant="icon" size="icon">
          <Settings size={18} />
        </Button>
      } />

      <Card className="flex items-center gap-4 mt-2 mb-6">
        <Avatar name={session?.userName || "Tú"} size={56} active />
        <div className="flex-1">
          <h2 className="text-[17px] font-semibold text-blanco-calido">{session?.userName || "tú"}</h2>
          <p className="text-[13px] text-muted">En línea</p>
        </div>
      </Card>

      <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido mb-3">
        Fuentes de medios
      </h2>
      <div className="flex flex-col gap-2 mb-6">
        <ServiceCard
          name="Jellyfin"
          description={session ? `${session.serverName} · ${session.serverUrl}` : "No conectado"}
          status={session ? "connected" : "disconnected"}
        />
        <ServiceCard
          name="YouTube"
          description="No conectado"
          status="disconnected"
        />
        <ServiceCard
          name="Plex"
          description="No conectado"
          status="disconnected"
        />
      </div>

      <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido mb-3">
        Estado de Sync
      </h2>
      <Card className="flex items-center gap-4 mb-6">
        <SyncIcon variant="dark" size={48} />
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold text-blanco-calido">Servidor Jellyfin</h3>
          <p className="text-[13px] text-muted truncate">{session?.serverUrl || "No conectado"}</p>
        </div>
        <Badge variant={session ? "coral" : "dim"}>
          {session ? "● En línea" : "Desconectado"}
        </Badge>
      </Card>

      <Button variant="ghost" className="w-full text-dim hover:text-coral" onClick={handleLogout}>
        <LogOut size={16} className="mr-2" />
        Cerrar sesión
      </Button>
    </div>
  )
}

function ServiceCard({
  name,
  description,
  status,
}: {
  name: string
  description: string
  status: "connected" | "disconnected"
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${status === "connected" ? "bg-escarlata/15" : "bg-carbon-3"}`}>
        {status === "connected" ? (
          <CheckCircle size={20} className="text-escarlata" />
        ) : (
          <XCircle size={20} className="text-dim" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-semibold text-blanco-calido">{name}</h3>
        <p className="text-[13px] text-muted truncate">{description}</p>
      </div>
      <Badge variant={status === "connected" ? "coral" : "dim"}>
        {status === "connected" ? "Conectado" : "Desconectado"}
      </Badge>
    </Card>
  )
}