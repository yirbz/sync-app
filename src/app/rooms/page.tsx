"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/layout/header"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { createRoom, getMyRooms, joinRoomByInviteCode, syncRoomsWithServer, getInviteLink, type Room } from "@/lib/room"
import { getLibraries, getItems, type LibraryFolder, type LibraryItem } from "@/lib/library"
import { useRouter, useSearchParams } from "next/navigation"
import { Play, Users, Plus, Link, Copy, Check, X, Loader2, Share2 } from "lucide-react"

export default function RoomsPage() {
  const { session } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(searchParams?.get("create") === "true")
  const [showJoin, setShowJoin] = useState(false)
  const [newName, setNewName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [libraries, setLibraries] = useState<LibraryFolder[]>([])
  const [selectedLibrary, setSelectedLibrary] = useState<string>("")
  const [items, setItems] = useState<LibraryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        await syncRoomsWithServer()
        setRooms(await getMyRooms())
        const libs = await getLibraries()
        setLibraries(libs)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedLibrary) return
    getItems(selectedLibrary, { limit: 20 }).then((r) => setItems(r.items))
  }, [selectedLibrary])

  const handleCreate = async () => {
    if (!newName.trim() || !session) return
    setCreating(true)
    try {
      const room = await createRoom(newName.trim(), selectedItems, session.userName)
      setRooms(await getMyRooms())
      setShowCreate(false)
      setNewName("")
      setSelectedItems([])
      router.push(`/rooms/${room.id}`)
    } catch (err: any) {
      console.error("Error creating room:", err)
    }
    setCreating(false)
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    try {
      const room = await joinRoomByInviteCode(inviteCode.trim().toUpperCase())
      if (room) {
        setRooms(await getMyRooms())
        setShowJoin(false)
        setInviteCode("")
        router.push(`/rooms/${room.id}`)
      }
    } catch {}
  }

  const copyInviteLink = (room: Room) => {
    const link = getInviteLink(room)
    navigator.clipboard.writeText(link)
    setCopiedId(room.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="pt-[72px] px-4 pb-4">
      <Header
        title="Salas"
        action={
          <div className="flex gap-2">
            <Button variant="icon" size="icon" onClick={() => setShowJoin(true)} title="Unirse a sala">
              <Plus size={18} className="rotate-45" />
            </Button>
            <Button variant="icon" size="icon" onClick={() => setShowCreate(true)} title="Crear sala">
              <Plus size={18} />
            </Button>
          </div>
        }
      />

      {/* Create room modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-carbon/80 flex items-end sm:items-center justify-center">
          <div className="bg-carbon-2 rounded-t-[20px] sm:rounded-[20px] w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-[650] text-blanco-calido">Nueva sala</h2>
              <button onClick={() => setShowCreate(false)} className="text-dim hover:text-blanco-calido">
                <X size={20} />
              </button>
            </div>

            <Input label="Nombre de la sala" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Viernes de pelis" />

            <div className="mt-4">
              <label className="text-[13px] font-medium text-muted block mb-2">Seleccionar biblioteca</label>
              <div className="flex flex-wrap gap-2">
                {libraries.map((lib) => (
                  <button
                    key={lib.id}
                    onClick={() => setSelectedLibrary(lib.id === selectedLibrary ? "" : lib.id)}
                    className={`px-3 py-1.5 rounded-[12px] text-[13px] font-medium transition-colors ${
                      selectedLibrary === lib.id ? "bg-escarlata text-blanco-calido" : "bg-carbon-3 text-muted hover:text-blanco-calido"
                    }`}
                  >
                    {lib.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedLibrary && items.length > 0 && (
              <div className="mt-3">
                <label className="text-[13px] font-medium text-muted block mb-2">Seleccionar contenido ({selectedItems.length})</label>
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                  {items.slice(0, 10).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-[12px] text-left transition-colors ${
                        selectedItems.includes(item.id) ? "bg-escarlata/15 border border-escarlata/30" : "bg-carbon-3 hover:bg-carbon-3/50"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedItems.includes(item.id) ? "border-escarlata bg-escarlata" : "border-dim"
                      }`}>
                        {selectedItems.includes(item.id) && <Check size={12} className="text-blanco-calido" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-blanco-calido truncate">{item.name}</p>
                        <p className="text-[11px] text-dim">{item.year || ""}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleCreate} disabled={creating || !newName.trim()}>
                {creating ? <Loader2 size={16} className="animate-spin" /> : "Crear sala"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Join room modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 bg-carbon/80 flex items-end sm:items-center justify-center">
          <div className="bg-carbon-2 rounded-t-[20px] sm:rounded-[20px] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-[650] text-blanco-calido">Unirse a sala</h2>
              <button onClick={() => setShowJoin(false)} className="text-dim hover:text-blanco-calido">
                <X size={20} />
              </button>
            </div>
            <Input label="Código de invitación" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="Ej: ABC123" maxLength={6} />
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowJoin(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleJoin} disabled={inviteCode.trim().length < 4}>Unirse</Button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-dim" />
        </div>
      ) : rooms.length > 0 ? (
        <div className="flex flex-col gap-3 mt-2">
          {rooms.map((room) => (
            <div key={room.id} onClick={() => router.push(`/rooms/${room.id}`)} className="cursor-pointer">
              <Card className="flex items-center gap-4 hover:bg-carbon-3 transition-colors">
                <Avatar name={room.name} size={48} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-semibold leading-[1.25] text-blanco-calido truncate">{room.name}</h3>
                  <p className="text-[13px] text-muted mt-0.5 truncate">{room.itemIds.length > 0 ? `${room.itemIds.length} items` : "Sin contenido"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={room.status === "playing" ? "coral" : "dim"}>
                      {room.status === "playing" ? "● En vivo" : "Inactiva"}
                    </Badge>
                    <span className="text-[12px] text-dim">{room.participantCount} viendo</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); copyInviteLink(room) }}
                  className="shrink-0 w-10 h-10 rounded-full bg-carbon-3 flex items-center justify-center hover:bg-carbon-2 transition-colors"
                  title="Copiar link de invitación"
                >
                  {copiedId === room.id ? <Check size={16} className="text-escarlata" /> : <Share2 size={16} className="text-dim" />}
                </button>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users size={40} className="text-dim mb-4" />
          <p className="text-[15px] text-muted mb-1">No tienes salas aún</p>
          <p className="text-[13px] text-dim mb-4">Crea una sala o únete con un código</p>
          <div className="flex gap-3">
            <Button onClick={() => setShowCreate(true)}>Crear sala</Button>
            <Button variant="secondary" onClick={() => setShowJoin(true)}>Unirse</Button>
          </div>
        </div>
      )}
    </div>
  )
}