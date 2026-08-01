"use client"

import { useEffect, useState, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  createRoom, getMyRooms, joinRoomByInviteCode, deleteRoom,
  updateRoomName, getInviteLink, type Room
} from "@/lib/room"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Play, Users, Plus, X, Loader2, Share2, Check, Hash,
  Search, MoreVertical, Trash2, Edit3, LogIn, Sparkles
} from "lucide-react"

export default function RoomsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-carbon">
          <Loader2 size={24} className="animate-spin text-dim" />
        </div>
      }
    >
      <RoomsContent />
    </Suspense>
  )
}

function RoomsContent() {
  const { session } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [showCreate, setShowCreate] = useState(searchParams?.get("create") === "true")
  const [showJoin, setShowJoin] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null)

  // Form inputs
  const [newName, setNewName] = useState("")
  const [editNameInput, setEditNameInput] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  // Action states
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [createError, setCreateError] = useState("")
  const [joinError, setJoinError] = useState("")
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const loadRooms = useCallback(async () => {
    try {
      const data = await getMyRooms()
      setRooms(data)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true
    getMyRooms().then((data) => {
      if (mounted) {
        setRooms(data)
        setLoading(false)
      }
    }).catch(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleCreate = async () => {
    if (!newName.trim() || !session) return
    setCreating(true)
    setCreateError("")
    try {
      const room = await createRoom(newName.trim(), [])
      await loadRooms()
      setShowCreate(false)
      setNewName("")
      router.push(`/rooms/${room.id}`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      setCreateError(errorObj?.message || "Error al crear la sala")
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    setJoinError("")
    try {
      const room = await joinRoomByInviteCode(inviteCode.trim().toUpperCase())
      if (room) {
        await loadRooms()
        setShowJoin(false)
        setInviteCode("")
        router.push(`/rooms/${room.id}`)
      } else {
        setJoinError("Código no válido o sala inactiva")
      }
    } catch {
      setJoinError("No se pudo encontrar la sala")
    }
  }

  const handleEditRoomName = async () => {
    if (!editingRoom || !editNameInput.trim()) return
    setEditing(true)
    try {
      await updateRoomName(editingRoom.id, editNameInput.trim())
      await loadRooms()
      setEditingRoom(null)
    } catch {}
    setEditing(false)
  }

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return
    setDeleting(true)
    try {
      await deleteRoom(deletingRoom.id)
      await loadRooms()
      setDeletingRoom(null)
    } catch {}
    setDeleting(false)
  }

  const copyInviteLink = (room: Room, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    navigator.clipboard.writeText(getInviteLink(room))
    setCopiedId(room.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredRooms = rooms.filter((r) => {
    const q = searchQuery.toLowerCase().trim()
    return (
      r.name.toLowerCase().includes(q) ||
      r.inviteCode.toLowerCase().includes(q) ||
      r.createdBy.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col min-h-dvh bg-carbon text-blanco-calido pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(76px+env(safe-area-inset-bottom))] px-4">
      {/* Header Bar */}
      <div className="py-3 flex items-center justify-between border-b border-white/5 mb-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-blanco-calido">Inicio</h1>
          <p className="text-[12px] text-dim">Tus salas y sesiones de cine en casa</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowJoin(true)}
            className="px-3 py-1.5 rounded-full bg-carbon-3 border border-white/10 text-blanco-calido text-[12px] font-medium hover:bg-carbon-2 transition-colors flex items-center gap-1.5"
          >
            <LogIn size={14} className="text-coral" />
            Unirse
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="px-3.5 py-1.5 rounded-full bg-escarlata text-blanco-calido text-[12px] font-semibold hover:bg-escarlata-2 shadow-fab transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={15} />
            Crear
          </button>
        </div>
      </div>

      {/* Search Input */}
      {rooms.length > 0 && (
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="w-full rounded-[14px] bg-carbon-2/90 border border-white/5 pl-10 pr-3.5 py-2.5 text-[13px] text-blanco-calido placeholder-dim outline-none focus:border-escarlata/50 transition-colors"
          />
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-dim" />
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="space-y-3 flex-1">
          {filteredRooms.map((room) => {
            const isMenuOpen = activeMenuId === room.id

            return (
              <div
                key={room.id}
                className="relative rounded-[18px] bg-carbon-2/80 border border-white/5 p-4 shadow-card hover:border-escarlata/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[16px] font-semibold text-blanco-calido truncate group-hover:text-escarlata transition-colors">
                        {room.name}
                      </h3>
                      <Badge variant={room.status === "playing" ? "coral" : "dim"} className="shrink-0">
                        {room.status === "playing" ? "En vivo" : "Inactiva"}
                      </Badge>
                    </div>
                    <p className="text-[12px] text-dim truncate">
                      {room.currentItem ? room.currentItem.title : `Creada por ${room.createdBy}`}
                    </p>
                  </div>

                  {/* Actions Dropdown Button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(isMenuOpen ? null : room.id)}
                      className="w-8 h-8 rounded-full bg-carbon-3/80 flex items-center justify-center text-dim hover:text-blanco-calido hover:bg-carbon-3 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Popover Actions Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-10 z-30 w-44 rounded-[14px] bg-carbon-3 border border-white/10 shadow-elevated p-1.5 animate-in fade-in slide-in-from-top-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null)
                            copyInviteLink(room)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[12px] text-blanco-calido hover:bg-carbon-2 transition-colors"
                        >
                          <Share2 size={14} className="text-coral" />
                          Copiar invitación
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null)
                            setEditingRoom(room)
                            setEditNameInput(room.name)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[12px] text-blanco-calido hover:bg-carbon-2 transition-colors"
                        >
                          <Edit3 size={14} className="text-muted" />
                          Editar nombre
                        </button>

                        <div className="my-1 border-t border-white/5" />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null)
                            setDeletingRoom(room)
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[12px] text-coral hover:bg-coral/10 transition-colors"
                        >
                          <Trash2 size={14} />
                          Eliminar sala
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Info & Enter Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-dim flex items-center gap-1 bg-carbon-3 px-2 py-1 rounded-[6px]">
                      <Hash size={10} className="text-coral" /> {room.inviteCode}
                    </span>
                    <span className="text-[11px] text-muted flex items-center gap-1">
                      <Users size={12} /> {room.participantCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => copyInviteLink(room, e)}
                      className="px-2.5 py-1.5 rounded-[10px] bg-carbon-3 text-dim hover:text-blanco-calido text-[11px] font-medium transition-colors flex items-center gap-1"
                    >
                      {copiedId === room.id ? (
                        <>
                          <Check size={12} className="text-escarlata" /> Copiado
                        </>
                      ) : (
                        <>
                          <Share2 size={12} /> Código
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push(`/rooms/${room.id}`)}
                      className="px-3 py-1.5 rounded-[10px] bg-escarlata text-blanco-calido text-[12px] font-semibold hover:bg-escarlata-2 transition-transform active:scale-95 flex items-center gap-1"
                    >
                      <Play size={13} fill="currentColor" /> Entrar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-full bg-carbon-2 border border-white/5 flex items-center justify-center text-dim mb-3">
            <Users size={28} />
          </div>
          <p className="text-[15px] font-semibold text-blanco-calido mb-1">
            {searchQuery ? "Sin resultados para tu búsqueda" : "No tienes salas activas"}
          </p>
          <p className="text-[13px] text-dim mb-5 max-w-xs">
            {searchQuery ? "Intenta con otro término o código" : "Crea una nueva sala o únete a una existente con un código"}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-1" /> Crear sala
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowJoin(true)}>
              <LogIn size={14} className="mr-1" /> Unirse
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Create Room */}
      {showCreate && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-carbon-2 border-t sm:border border-white/10 rounded-t-[24px] sm:rounded-[24px] w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-escarlata" />
                <h2 className="text-[18px] font-bold text-blanco-calido">Nueva sala</h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setCreateError(""); }}
                className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido"
              >
                <X size={16} />
              </button>
            </div>

            <Input
              label="Nombre de la sala"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Películas del fin de semana"
              autoFocus
            />

            {createError && (
              <div className="mt-3 text-[12px] text-coral bg-coral/10 rounded-[10px] px-3 py-2 font-medium">
                {createError}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setShowCreate(false); setCreateError(""); }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : "Crear sala"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Join Room */}
      {showJoin && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-carbon-2 border-t sm:border border-white/10 rounded-t-[24px] sm:rounded-[24px] w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LogIn size={18} className="text-coral" />
                <h2 className="text-[18px] font-bold text-blanco-calido">Unirse a sala</h2>
              </div>
              <button
                type="button"
                onClick={() => { setShowJoin(false); setJoinError(""); }}
                className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido"
              >
                <X size={16} />
              </button>
            </div>

            <Input
              label="Código de invitación"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Ej. SYNC12"
              maxLength={10}
              autoFocus
            />

            {joinError && (
              <div className="mt-3 text-[12px] text-coral bg-coral/10 rounded-[10px] px-3 py-2 font-medium">
                {joinError}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setShowJoin(false); setJoinError(""); }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleJoin}
                disabled={inviteCode.trim().length < 3}
              >
                Unirse
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Room Name */}
      {editingRoom && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-carbon-2 border-t sm:border border-white/10 rounded-t-[24px] sm:rounded-[24px] w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-escarlata" />
                <h2 className="text-[18px] font-bold text-blanco-calido">Editar sala</h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido"
              >
                <X size={16} />
              </button>
            </div>

            <Input
              label="Nombre de la sala"
              value={editNameInput}
              onChange={(e) => setEditNameInput(e.target.value)}
              placeholder="Nuevo nombre"
              autoFocus
            />

            <div className="flex gap-2 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setEditingRoom(null)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleEditRoomName} disabled={editing || !editNameInput.trim()}>
                {editing ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Room Confirmation */}
      {deletingRoom && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-carbon-2 border-t sm:border border-white/10 rounded-t-[24px] sm:rounded-[24px] w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-coral">
                <Trash2 size={20} />
                <h2 className="text-[18px] font-bold text-blanco-calido">Eliminar sala</h2>
              </div>
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[14px] text-muted leading-relaxed mb-6">
              ¿Estás seguro de que deseas eliminar la sala{" "}
              <span className="font-semibold text-blanco-calido">&quot;{deletingRoom.name}&quot;</span>? Esta acción eliminará el historial de mensajes y la sesión.
            </p>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDeletingRoom(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-coral hover:bg-coral/90 text-blanco-calido"
                onClick={handleDeleteRoom}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
