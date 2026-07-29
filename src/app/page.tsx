"use client"

import { useEffect, useState } from "react"
import { SyncIcon } from "@/components/icons/sync-icon"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { getMyRooms, syncRoomsWithServer, type Room } from "@/lib/room"
import { getItems, type LibraryItem } from "@/lib/library"
import Link from "next/link"
import { Plus, Play, Loader2 } from "lucide-react"

export default function Home() {
  const { session } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [recentItems, setRecentItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        await syncRoomsWithServer()
        setRooms((await getMyRooms()).slice(0, 3))

        const result = await getItems(undefined, { limit: 4, sortBy: "DateCreated", sortOrder: "Descending" })
        setRecentItems(result.items)
      } catch {
        // Not critical
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col min-h-full">
      <section className="pt-16 pb-8 px-4 flex flex-col items-center text-center">
        <SyncIcon variant="primary" size={80} className="mb-5" />
        <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-blanco-calido mb-2">
          Sync
        </h1>
        {session && (
          <p className="text-[13px] text-dim mb-1">{session.serverName} — {session.userName}</p>
        )}
        <p className="text-[15px] leading-[1.45] text-muted max-w-xs">
          Ver juntos. Crea una sala, invita amigos y sincroniza tu contenido.
        </p>
      </section>

      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido">
            Salas activas
          </h2>
          <Link
            href="/rooms"
            className="text-[13px] font-medium text-muted hover:text-blanco-calido transition-colors"
          >
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-dim" />
          </div>
        ) : rooms.length > 0 ? (
          <div className="flex flex-col gap-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <RoomCard name={room.name} media={room.itemIds.length > 0 ? `${room.itemIds.length} items` : "Sin contenido"} users={room.participantCount} status={room.status} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center py-8 text-center">
            <p className="text-[15px] text-muted mb-2">No hay salas activas</p>
            <Link href="/rooms?create=true">
              <Button size="sm">Crear una sala</Button>
            </Link>
          </Card>
        )}
      </section>

      <section className="px-4 mb-6">
        <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido mb-3">
          Recién agregado
        </h2>
        {recentItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentItems.map((item) => (
              <Link key={item.id} href={`/library`}>
                <Card className="flex items-center gap-4 py-3 hover:bg-carbon-3 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-carbon-3 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.imageTags?.Primary ? (
                      <img src={`${session?.serverUrl}/Items/${item.id}/Images/Primary?api_key=${session?.token}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Play size={18} className="text-dim" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-blanco-calido truncate">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-muted">
                      {item.type === "Movie" ? "Película" : item.type === "Series" ? "Serie" : item.type} {item.year ? `· ${item.year}` : ""}
                    </p>
                  </div>
                  <Badge variant="dim">{item.type === "Movie" ? "Película" : item.type === "Series" ? "Serie" : item.type}</Badge>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-dim text-center py-6">No hay contenido reciente</p>
        )}
      </section>

      <section className="px-4 mb-6">
        <h2 className="text-[20px] font-[650] leading-[1.2] tracking-[-0.01em] text-blanco-calido mb-3">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/rooms?create=true">
            <Card className="flex flex-col items-center justify-center py-8 gap-2 hover:bg-carbon-3 transition-colors cursor-pointer">
              <Plus size={28} className="text-escarlata" />
              <span className="text-[15px] font-semibold text-blanco-calido">Nueva sala</span>
            </Card>
          </Link>
          <Link href="/library">
            <Card className="flex flex-col items-center justify-center py-8 gap-2 hover:bg-carbon-3 transition-colors cursor-pointer">
              <Play size={28} className="text-escarlata" />
              <span className="text-[15px] font-semibold text-blanco-calido">Explorar biblioteca</span>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}

function RoomCard({ name, media, users, status }: { name: string; media: string; users: number; status: string }) {
  return (
    <Card className="flex items-center gap-4 hover:bg-carbon-3 transition-colors cursor-pointer">
      <div className="flex-1 min-w-0">
        <h3 className="text-[17px] font-semibold leading-[1.25] text-blanco-calido truncate">{name}</h3>
        <p className="text-[13px] text-muted mt-0.5 truncate">{media}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant={status === "playing" ? "coral" : "dim"}>
            {status === "playing" ? "● En vivo" : "Inactiva"}
          </Badge>
          <span className="text-[12px] text-dim">{users} viendo</span>
        </div>
      </div>
      <Button variant="icon" size="icon" className="shrink-0">
        <Play size={18} />
      </Button>
    </Card>
  )
}