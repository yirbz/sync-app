"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getLibraries, getItems, type LibraryFolder, type LibraryItem } from "@/lib/library"
import { getItemImageUrl } from "@/lib/jellyfin"
import { createRoom } from "@/lib/room"
import { SyncIcon } from "@/components/icons/sync-icon"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Particles } from "@/components/magicui/particles"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import {
  Search, Film, Monitor, Headphones, Loader2, ChevronLeft,
  Tv, Play, Check, Copy, X, Link2
} from "lucide-react"

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

const youtubePresets = [
  { id: "y1", title: "Tráiler Oficial GTA 6 (4K 60FPS)", channel: "Rockstar Games", url: "https://www.youtube.com/watch?v=QdBZY2fkU-0" },
  { id: "y2", title: "Lofi Hip Hop Radio — Beats to Relax/Study", channel: "Lofi Girl", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk" },
  { id: "y3", title: "Synthwave Live DJ Concert 2024", channel: "Cyber Sound", url: "https://www.youtube.com/watch?v=4xDzrJKXOOY" },
]

export default function LibraryPage() {
  const { session } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"jellyfin" | "youtube">("jellyfin")
  const [libraries, setLibraries] = useState<LibraryFolder[]>([])
  const [items, setItems] = useState<LibraryItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedLib, setSelectedLib] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const [loadingLibs, setLoadingLibs] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  // YouTube / Custom URL state
  const [customUrlInput, setCustomUrlInput] = useState("")
  const [launchingCustom, setLaunchingCustom] = useState(false)

  useEffect(() => {
    let isMounted = true
    getLibraries().then((libs) => {
      if (isMounted) {
        setLibraries(libs)
        setLoadingLibs(false)
      }
    }).catch(() => {
      if (isMounted) setLoadingLibs(false)
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedLib) return
    let isMounted = true
    getItems(selectedLib, {
      type: selectedType === "all" ? undefined : selectedType,
      limit: 50,
      sortBy: "SortName",
      searchTerm: searchTerm,
    }).then((result) => {
      if (isMounted) {
        setItems(result.items)
        setTotal(result.total)
        setLoadingItems(false)
      }
    }).catch(() => {
      if (isMounted) setLoadingItems(false)
    })
    return () => {
      isMounted = false
    }
  }, [selectedLib, selectedType, searchTerm])

  const handleSelectLib = (libId: string) => {
    if (selectedLib === libId) {
      setSelectedLib(null)
      setItems([])
      setTotal(0)
    } else {
      setSelectedLib(libId)
      setLoadingItems(true)
    }
  }

  const handleCreateRoomWithItem = async (item: LibraryItem) => {
    setCreatingRoom(true)
    try {
      const room = await createRoom(`Cine: ${item.name}`, [])
      setSelectedItem(null)
      router.push(`/rooms/${room.id}?mediaId=${item.id}`)
    } catch {}
    setCreatingRoom(false)
  }

  const handleLaunchCustomUrl = async (url: string) => {
    if (!url.trim()) return
    setLaunchingCustom(true)
    try {
      const room = await createRoom("Transmisión en Vivo", [])
      router.push(`/rooms/${room.id}?url=${encodeURIComponent(url.trim())}`)
    } catch {}
    setLaunchingCustom(false)
  }

  const copyItemId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
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
              Biblioteca
            </h1>
            <p className="text-[12px] text-muted">
              {session?.serverName ? `Servidor: ${session.serverName}` : "Explora y transmite medios con tus amigos"}
            </p>
          </div>
        </div>

        {/* Source Selector Tabs */}
        <div className="flex items-center gap-1 bg-carbon-2 p-1 rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("jellyfin")}
            className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "jellyfin" ? "bg-escarlata text-white shadow-sm" : "text-muted hover:text-white"
            }`}
          >
            <Tv size={14} />
            <span>Jellyfin</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("youtube")}
            className={`px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === "youtube" ? "bg-escarlata text-white shadow-sm" : "text-muted hover:text-white"
            }`}
          >
            <YoutubeIcon />
            <span>YouTube & Links</span>
          </button>
        </div>
      </div>

      {/* JELLYFIN TAB CONTENT */}
      {activeTab === "jellyfin" && (
        <div className="space-y-6 relative z-10">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
            <input
              placeholder="Buscar películas, series o música en Jellyfin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[18px] bg-carbon-2/90 pl-11 pr-4 py-3 text-[14px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata transition-colors shadow-card"
            />
          </div>

          {/* Root View: List of Libraries */}
          {!selectedLib && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-bold text-blanco-calido">Bibliotecas Disponibles</h2>

              {loadingLibs ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-dim" />
                </div>
              ) : libraries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {libraries.map((lib) => (
                    <div
                      key={lib.id}
                      onClick={() => handleSelectLib(lib.id)}
                      className="group relative rounded-[22px] border border-white/10 bg-carbon-2/90 p-5 shadow-card hover:border-escarlata/40 transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center space-y-2"
                    >
                      <BorderBeam size={120} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />
                      <div className="w-12 h-12 rounded-2xl bg-escarlata/15 border border-escarlata/30 flex items-center justify-center text-escarlata group-hover:scale-110 transition-transform">
                        {lib.collectionType === "movies" ? (
                          <Film size={22} />
                        ) : lib.collectionType === "tvshows" ? (
                          <Monitor size={22} />
                        ) : lib.collectionType === "music" ? (
                          <Headphones size={22} />
                        ) : (
                          <Tv size={22} />
                        )}
                      </div>
                      <h3 className="text-[14.5px] font-bold text-blanco-calido">{lib.name}</h3>
                      <span className="text-[11px] text-dim">{lib.itemCount || 0} elementos</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/5 bg-carbon-2/60 p-8 text-center space-y-2">
                  <p className="text-[14px] text-muted">No se pudieron cargar las bibliotecas de Jellyfin</p>
                  <p className="text-[12px] text-dim">Verifica que tu servidor Jellyfin esté activo en la sección Perfil.</p>
                </div>
              )}
            </div>
          )}

          {/* Selected Library Items View */}
          {selectedLib && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedLib(null); setItems([]); setSearchTerm("") }}
                    className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <h2 className="text-[17px] font-bold text-blanco-calido">
                      {libraries.find((l) => l.id === selectedLib)?.name || "Biblioteca"}
                    </h2>
                    <span className="text-[11px] text-dim">{total} títulos encontrados</span>
                  </div>
                </div>

                {/* Type Filters */}
                <div className="flex gap-1.5">
                  {["all", "Movie", "Series"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1 rounded-full text-[11.5px] font-semibold transition-all ${
                        selectedType === type ? "bg-escarlata text-white" : "bg-carbon-3 text-dim hover:text-white"
                      }`}
                    >
                      {type === "all" ? "Todo" : type === "Movie" ? "Películas" : "Series"}
                    </button>
                  ))}
                </div>
              </div>

              {loadingItems ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-dim" />
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {items.map((item) => {
                    const imgUrl = getItemImageUrl(item.id, item.imageTags?.Primary)
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group relative rounded-[18px] border border-white/10 bg-carbon-2 cursor-pointer transition-all hover:border-escarlata/40 overflow-hidden shadow-card"
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
                              <Film size={28} />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent p-3 flex flex-col justify-end">
                            <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-wider">
                              {item.type === "Movie" ? "Película" : item.type === "Series" ? "Serie" : item.type}
                            </span>
                            <h3 className="text-[13px] font-bold text-blanco-calido truncate">{item.name}</h3>
                            {item.year && <span className="text-[11px] text-muted">{item.year}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/5 bg-carbon-2/60 p-8 text-center space-y-2">
                  <p className="text-[14px] text-muted">Sin elementos disponibles</p>
                  <p className="text-[12px] text-dim">No se encontraron películas ni series en esta carpeta.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* YOUTUBE & LINKS TAB CONTENT */}
      {activeTab === "youtube" && (
        <div className="space-y-6 relative z-10">
          <div className="rounded-[26px] border border-white/10 bg-carbon-2/90 p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Link2 size={18} className="text-emerald-400" />
              <h2 className="text-[15px] font-bold text-blanco-calido">Transmitir Enlace Directo</h2>
            </div>
            <p className="text-[13px] text-muted">
              Pega cualquier enlace de YouTube o archivo de video en la nube (MP4/HLS) para iniciar una sala en sincronía con tus amigos.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleLaunchCustomUrl(customUrlInput); }} className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 rounded-xl bg-carbon-3 px-4 py-3 text-[13.5px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata"
              />
              <button
                type="submit"
                disabled={launchingCustom || !customUrlInput.trim()}
                className="px-5 py-3 rounded-xl bg-escarlata hover:bg-escarlata-2 text-white text-[13px] font-bold transition-all active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                {launchingCustom ? <Loader2 size={16} className="animate-spin" /> : "Iniciar Transmisión"}
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-[15px] font-bold text-blanco-calido">Sugerencias Populares de YouTube</h3>
            <div className="space-y-2.5">
              {youtubePresets.map((y) => (
                <div
                  key={y.id}
                  className="p-3.5 rounded-2xl bg-carbon-2/80 border border-white/5 flex items-center justify-between hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                      <YoutubeIcon />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-blanco-calido">{y.title}</p>
                      <span className="text-[11px] text-muted">{y.channel}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchCustomUrl(y.url)}
                    className="px-3.5 py-1.5 rounded-full bg-carbon-3 hover:bg-escarlata text-blanco-calido text-[12px] font-bold transition-colors flex items-center gap-1"
                  >
                    <Play size={12} fill="white" />
                    <span>Ver en sala</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Item Action Sheet Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-carbon-2 border-t sm:border border-white/10 rounded-t-[28px] sm:rounded-[28px] w-full max-w-md p-6 space-y-5 animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[11px] font-mono text-coral font-bold uppercase tracking-wider">
                  {selectedItem.type === "Movie" ? "Película" : selectedItem.type}
                </span>
                <h3 className="text-[18px] font-extrabold text-blanco-calido leading-tight mt-0.5">
                  {selectedItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <ShimmerButton
                onClick={() => handleCreateRoomWithItem(selectedItem)}
                disabled={creatingRoom}
                className="w-full py-3.5 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2"
              >
                {creatingRoom ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Play size={16} fill="white" />
                    <span>Crear Sala con esta Película</span>
                  </>
                )}
              </ShimmerButton>

              <button
                type="button"
                onClick={() => copyItemId(selectedItem.id)}
                className="w-full py-3 rounded-2xl bg-carbon-3 hover:bg-carbon-3/80 text-blanco-calido text-[13px] font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {copiedId ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copiedId ? "¡ID de elemento copiado!" : "Copiar ID de elemento"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}