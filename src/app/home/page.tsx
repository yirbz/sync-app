"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getMyRooms, createRoom, joinRoomByInviteCode, getInviteLink, type Room } from "@/lib/room"
import { getItems, type LibraryItem } from "@/lib/library"
import { getItemImageUrl } from "@/lib/jellyfin"
import { SyncIcon } from "@/components/icons/sync-icon"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Particles } from "@/components/magicui/particles"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import {
  Play, Plus, Users, Tv, Check, Share2, LogIn,
  Loader2, Search, Link2, Film, Hash, RefreshCw, X, AlertCircle
} from "lucide-react"

export default function AppHomePage() {
  const { session } = useAuth()
  const router = useRouter()

  // Real Data State
  const [rooms, setRooms] = useState<Room[]>([])
  const [mediaItems, setMediaItems] = useState<LibraryItem[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMedia, setLoadingMedia] = useState(true)

  // Form & Action States
  const [roomNameInput, setRoomNameInput] = useState("")
  const [inviteCodeInput, setInviteCodeInput] = useState("")
  const [directUrlInput, setDirectUrlInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [launchingUrl, setLaunchingUrl] = useState(false)
  const [actionError, setActionError] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoadingRooms(true)
    try {
      const roomData = await getMyRooms()
      setRooms(roomData)
    } catch {}
    setLoadingRooms(false)

    setLoadingMedia(true)
    try {
      const { items } = await getItems(undefined, { limit: 8, sortBy: "DateCreated", sortOrder: "Descending" })
      setMediaItems(items)
    } catch {}
    setLoadingMedia(false)
  }, [])

  useEffect(() => {
    let isMounted = true
    getMyRooms().then((data) => {
      if (isMounted) {
        setRooms(data)
        setLoadingRooms(false)
      }
    }).catch(() => {
      if (isMounted) setLoadingRooms(false)
    })

    getItems(undefined, { limit: 8, sortBy: "DateCreated", sortOrder: "Descending" }).then(({ items }) => {
      if (isMounted) {
        setMediaItems(items)
        setLoadingMedia(false)
      }
    }).catch(() => {
      if (isMounted) setLoadingMedia(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleCreateRoom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const name = roomNameInput.trim() || `Sala de ${session?.userName || "Cine"}`
    setCreating(true)
    setActionError("")
    try {
      const newRoom = await createRoom(name, [])
      setRoomNameInput("")
      setShowCreateModal(false)
      router.push(`/rooms/${newRoom.id}`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      setActionError(errorObj?.message || "Error al crear la sala. Inténtalo de nuevo.")
      setCreating(false)
    }
  }

  const handleJoinByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = inviteCodeInput.trim().toUpperCase()
    if (!code) return
    setJoining(true)
    setActionError("")
    try {
      const room = await joinRoomByInviteCode(code)
      if (room) {
        await loadData()
        setInviteCodeInput("")
        setShowJoinModal(false)
        router.push(`/rooms/${room.id}`)
      } else {
        setActionError("No se encontró ninguna sala con ese código")
      }
    } catch {
      setActionError("Error al unirse a la sala")
    } finally {
      setJoining(false)
    }
  }

  const handleLaunchDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    const rawUrl = directUrlInput.trim()
    if (!rawUrl) return
    setLaunchingUrl(true)
    setActionError("")
    try {
      const formattedUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
        ? rawUrl
        : `https://${rawUrl}`
      let hostname = "En vivo"
      try { hostname = new URL(formattedUrl).hostname } catch {}
      const name = `Transmisión: ${hostname}`
      const newRoom = await createRoom(name, [])
      setDirectUrlInput("")
      router.push(`/rooms/${newRoom.id}?url=${encodeURIComponent(formattedUrl)}`)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      setActionError(errorObj?.message || "No se pudo crear la sala. Intenta de nuevo.")
    } finally {
      setLaunchingUrl(false)
    }
  }

  const copyInvite = (room: Room, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(getInviteLink(room))
    setCopiedId(room.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredMedia = mediaItems.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  )

  return (
    <div className="relative flex flex-col min-h-dvh bg-carbon text-blanco-calido pt-[max(0.75rem,env(safe-area-inset-top))] pb-[calc(76px+env(safe-area-inset-bottom))] px-4 md:px-6 max-w-5xl mx-auto selection:bg-escarlata selection:text-white">
      <Particles quantity={20} color="#FF6B7A" className="opacity-40" />

      {/* Top Header Bar */}
      <div className="py-4 flex items-center justify-between border-b border-white/5 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <SyncIcon size={38} variant="primary" className="rounded-[10px]" />
          <div>
            <h1 className="text-[20px] font-extrabold text-blanco-calido leading-tight">
              Inicio
            </h1>
            <p className="text-[12px] text-muted">
              {session?.userName ? `Conectado como ${session.userName}` : "Tu panel de sincronía en tiempo real"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="w-8 h-8 rounded-full bg-carbon-3/80 hover:bg-carbon-3 text-dim hover:text-blanco-calido flex items-center justify-center border border-white/5 transition-colors"
            title="Recargar datos"
          >
            <RefreshCw size={14} className={loadingRooms || loadingMedia ? "animate-spin" : ""} />
          </button>
          <ShimmerButton
            onClick={() => setShowCreateModal(true)}
            className="text-[12px] px-3.5 py-1.5 rounded-full flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Crear sala</span>
          </ShimmerButton>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Section 1: Quick Action Launchers Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Join by Invite Code Form */}
          <div className="md:col-span-6 rounded-[24px] border border-white/10 bg-carbon-2/90 p-5 shadow-card space-y-3 relative overflow-hidden">
            <BorderBeam size={160} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />

            <div className="flex items-center gap-2 relative z-10">
              <LogIn size={16} className="text-coral" />
              <h2 className="text-[14px] font-bold text-blanco-calido">Unirse con Código</h2>
            </div>

            <form onSubmit={handleJoinByCode} className="flex gap-2 relative z-10">
              <div className="relative flex-1">
                <Hash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="Código de invitación (ej. SYNC12)"
                  className="w-full rounded-xl bg-carbon-3 pl-9 pr-3 py-2.5 text-[13px] font-mono font-bold text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata"
                />
              </div>
              <button
                type="submit"
                disabled={joining || !inviteCodeInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-escarlata hover:bg-escarlata-2 text-blanco-calido text-[13px] font-bold transition-all active:scale-95 disabled:opacity-40 shrink-0 flex items-center gap-1.5"
              >
                {joining ? <Loader2 size={15} className="animate-spin" /> : "Entrar"}
              </button>
            </form>
          </div>

          {/* Launch Video Link Direct Form */}
          <div className="md:col-span-6 rounded-[24px] border border-white/10 bg-carbon-2/90 p-5 shadow-card space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Link2 size={16} className="text-emerald-400" />
              <h2 className="text-[14px] font-bold text-blanco-calido">Transmitir Link Directo</h2>
            </div>

            <form onSubmit={handleLaunchDirectUrl} className="flex gap-2">
              <input
                type="url"
                value={directUrlInput}
                onChange={(e) => setDirectUrlInput(e.target.value)}
                placeholder="Pega enlace de YouTube, MP4 o HLS..."
                className="flex-1 rounded-xl bg-carbon-3 px-3.5 py-2.5 text-[13px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata"
              />
              <button
                type="submit"
                disabled={launchingUrl || !directUrlInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-carbon-3 hover:bg-carbon-2 text-blanco-calido text-[13px] font-bold border border-white/10 transition-all active:scale-95 disabled:opacity-40 shrink-0 flex items-center gap-1.5"
              >
                {launchingUrl ? <Loader2 size={15} className="animate-spin" /> : "Transmitir"}
              </button>
            </form>
          </div>
        </section>

        {/* Global Action Error Alert */}
        {actionError && (
          <div className="flex items-center justify-between text-[13px] text-coral bg-coral/10 border border-coral/20 rounded-[14px] p-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{actionError}</span>
            </div>
            <button type="button" onClick={() => setActionError("")} className="text-coral hover:opacity-80">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Section 2: Real Active User Rooms */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-escarlata" />
              <h2 className="text-[15px] font-bold text-blanco-calido">Mis Salas de Transmisión</h2>
            </div>
            <Link href="/rooms" className="text-[12px] text-dim hover:text-blanco-calido transition-colors">
              Ver todas ({rooms.length}) →
            </Link>
          </div>

          {loadingRooms ? (
            <div className="py-10 flex justify-center">
              <Loader2 size={22} className="animate-spin text-dim" />
            </div>
          ) : rooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.slice(0, 4).map((room) => (
                <div
                  key={room.id}
                  onClick={() => router.push(`/rooms/${room.id}`)}
                  className="rounded-[20px] bg-carbon-2/90 border border-white/5 p-4 shadow-card hover:border-escarlata/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-blanco-calido group-hover:text-escarlata transition-colors truncate">
                        {room.name}
                      </h3>
                      <p className="text-[11px] text-dim truncate">
                        {room.currentItem ? room.currentItem.title : `Creada por ${room.createdBy}`}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      room.status === "playing" ? "bg-escarlata text-white" : "bg-carbon-3 text-dim border border-white/5"
                    }`}>
                      {room.status === "playing" ? "En vivo" : "Inactiva"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="font-mono text-dim flex items-center gap-1">
                      <Hash size={10} className="text-coral" /> {room.inviteCode}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => copyInvite(room, e)}
                        className="px-2.5 py-1 rounded-[8px] bg-carbon-3 text-dim hover:text-blanco-calido text-[11px] transition-colors flex items-center gap-1"
                      >
                        {copiedId === room.id ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
                        <span>{copiedId === room.id ? "Copiado" : "Link"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/rooms/${room.id}`)}
                        className="px-3 py-1 rounded-[8px] bg-escarlata text-blanco-calido font-semibold hover:bg-escarlata-2 transition-transform active:scale-95 flex items-center gap-1"
                      >
                        <Play size={12} fill="white" />
                        <span>Entrar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/5 bg-carbon-2/60 p-6 text-center space-y-3">
              <p className="text-[14px] text-muted">No tienes ninguna sala activa por el momento</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-full bg-escarlata text-blanco-calido text-[13px] font-bold hover:bg-escarlata-2 transition-transform active:scale-95"
              >
                Crear mi primera sala
              </button>
            </div>
          )}
        </section>

        {/* Section 3: Live Jellyfin Media Library Content */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tv size={16} className="text-coral" />
              <h2 className="text-[15px] font-bold text-blanco-calido">Catálogo Reciente (Jellyfin)</h2>
            </div>
            <Link href="/library" className="text-[12px] text-dim hover:text-blanco-calido transition-colors">
              Explorar catálogo completo →
            </Link>
          </div>

          {/* Search filter for media */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar títulos..."
              className="w-full rounded-xl bg-carbon-2/80 border border-white/5 pl-9 pr-3 py-2 text-[12.5px] text-blanco-calido placeholder-dim outline-none focus:border-white/20"
            />
          </div>

          {loadingMedia ? (
            <div className="py-10 flex justify-center">
              <Loader2 size={22} className="animate-spin text-dim" />
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredMedia.map((item) => {
                const imgUrl = getItemImageUrl(item.id, item.imageTags?.Primary)
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/library?item=${item.id}`)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 bg-carbon-2 cursor-pointer transition-all hover:border-escarlata/40"
                  >
                    <div className="aspect-[2/3] w-full bg-carbon-3 relative overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dim">
                          <Film size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[10px] font-mono text-coral font-semibold">{item.type}</span>
                        <p className="text-[12.5px] font-bold text-blanco-calido truncate">{item.name}</p>
                        {item.year && <span className="text-[10px] text-dim">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[22px] border border-white/5 bg-carbon-2/60 p-6 text-center">
              <p className="text-[13px] text-dim">
                {searchQuery ? "Sin coincidencias para la búsqueda" : "No se pudo cargar el catálogo de Jellyfin o el servidor está desconectado."}
              </p>
              <Link href="/library" className="text-[12px] text-escarlata hover:underline mt-2 inline-block font-semibold">
                Ir a la biblioteca
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Modal: Create Room */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-carbon-2 border border-white/10 rounded-[24px] w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-[16px] font-bold text-blanco-calido">Crear Nueva Sala</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-dim hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-muted block mb-1">Nombre de la sala</label>
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  placeholder="Ej. Cine nocturno con los pibes"
                  className="w-full rounded-xl bg-carbon-3 px-3.5 py-2.5 text-[13.5px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-3 text-muted text-[13px] font-semibold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-escarlata hover:bg-escarlata-2 text-white text-[13px] font-bold flex items-center gap-1.5"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : "Crear Sala"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Room */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-carbon-2 border border-white/10 rounded-[24px] w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-[16px] font-bold text-blanco-calido">Unirse a Sala por Código</h3>
              <button type="button" onClick={() => setShowJoinModal(false)} className="text-dim hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-muted block mb-1">Código de invitación</label>
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  placeholder="Ej. SYNC12"
                  className="w-full rounded-xl bg-carbon-3 px-3.5 py-2.5 text-[13.5px] font-mono font-bold text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-3 text-muted text-[13px] font-semibold hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={joining || !inviteCodeInput.trim()}
                  className="px-5 py-2 rounded-xl bg-escarlata hover:bg-escarlata-2 text-white text-[13px] font-bold flex items-center gap-1.5"
                >
                  {joining ? <Loader2 size={16} className="animate-spin" /> : "Unirse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
