"use client"

import { useEffect, useState, useCallback } from "react"
import { X, Plus, Check, Loader2, Search, TrendingUp } from "lucide-react"
import { apiYouTubeTrending, apiYouTubeSearch, type YouTubeVideoDTO } from "@/lib/api"

interface YouTubeBrowserModalProps {
  open: boolean
  onClose: () => void
  onSelect: (video: { platform: string; contentId: string; title: string; imageUrl?: string }) => void
  inQueueIds: string[]
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "", label: "Todas" },
  { key: "music", label: "Música" },
  { key: "gaming", label: "Juegos" },
  { key: "entertainment", label: "Entretenimiento" },
  { key: "news", label: "Noticias" },
  { key: "sports", label: "Deportes" },
  { key: "education", label: "Educación" },
  { key: "comedy", label: "Comedia" },
]

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return ""
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function YouTubeBrowserModal({ open, onClose, onSelect, inQueueIds }: YouTubeBrowserModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("")
  const [results, setResults] = useState<YouTubeVideoDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoDTO | null>(null)
  const [adding, setAdding] = useState(false)
  const [mode, setMode] = useState<"trending" | "search">("trending")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setCategory("")
      setResults([])
      setSelectedVideo(null)
      setMode("trending")
      setError(null)
    }
  }, [open])

  const loadTrending = useCallback(async (cat: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiYouTubeTrending(30, cat || undefined)
      setResults(data.items)
    } catch (err: any) {
      setError(err.message || "Error al cargar tendencias")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && mode === "trending") {
      loadTrending(category)
    }
  }, [open, category, mode, loadTrending])

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setMode("search")
    setSelectedVideo(null)
    try {
      const data = await apiYouTubeSearch(q, 30)
      setResults(data.items)
    } catch (err: any) {
      setError(err.message || "Error al buscar")
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setMode("trending")
    setSelectedVideo(null)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setMode("trending")
    setSelectedVideo(null)
  }

  const handleSelectVideo = (video: YouTubeVideoDTO) => {
    setSelectedVideo(prev => prev?.id === video.id ? null : video)
  }

  const handleAdd = () => {
    if (!selectedVideo || adding) return
    setAdding(true)
    onSelect({
      platform: "youtube",
      contentId: selectedVideo.id,
      title: selectedVideo.title,
      imageUrl: selectedVideo.thumbnails?.medium?.url || selectedVideo.thumbnails?.default?.url,
    })
    setTimeout(() => {
      setAdding(false)
      setSelectedVideo(null)
    }, 500)
  }

  if (!open) return null

  const isInQueue = selectedVideo ? inQueueIds.includes(selectedVideo.id) : false

  return (
    <div className="fixed inset-0 z-[70] bg-carbon flex flex-col pt-[env(safe-area-inset-top,0px)]">
      {/* Top bar with search */}
      <div className="shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-escarlata/10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} className="text-escarlata">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>
            </svg>
          </div>
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
              placeholder="Buscar en YouTube..."
              className="w-full rounded-[10px] bg-carbon-3 pl-9 pr-8 py-2 text-[13px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-carbon-2 flex items-center justify-center text-dim hover:text-blanco-calido"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            className="px-4 py-2 rounded-[10px] bg-escarlata text-blanco-calido text-[12px] font-semibold hover:bg-escarlata-2 transition-colors disabled:opacity-50 shrink-0"
          >
            Ir
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex overflow-x-auto px-3 pb-2 gap-1.5 scrollbar-none">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`shrink-0 px-3 py-1.5 rounded-[10px] text-[11px] font-medium transition-colors ${
                category === key && mode === "trending"
                  ? "bg-escarlata text-blanco-calido"
                  : "bg-carbon-3 text-dim hover:text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {error && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-[13px] text-coral">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-dim" />
          </div>
        ) : !error && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp size={32} className="text-dim mb-2" />
            <p className="text-[13px] text-muted">Sin resultados</p>
          </div>
        ) : !error ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {results.map((video) => {
              const isSelected = selectedVideo?.id === video.id
              const thumb = video.thumbnails?.medium?.url || video.thumbnails?.default?.url || ""
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => handleSelectVideo(video)}
                  className={`text-left rounded-[12px] overflow-hidden transition-all ${
                    isSelected
                      ? "ring-2 ring-escarlata ring-offset-2 ring-offset-carbon scale-[1.02]"
                      : "hover:bg-carbon-3"
                  }`}
                >
                  <div className="relative aspect-video bg-carbon-3">
                    {thumb && (
                      <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                    )}
                    {video.duration > 0 && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-[4px] bg-black/80 text-[10px] font-medium text-blanco-calido">
                        {formatDuration(video.duration)}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[12px] font-medium text-blanco-calido line-clamp-2 leading-snug">
                      {video.title}
                    </p>
                    <p className="text-[11px] text-dim mt-1 truncate">{video.channelTitle}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {/* Video selection bar */}
      <div className="shrink-0 border-t border-white/5 bg-carbon-2">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="flex-1 min-w-0">
            {selectedVideo ? (
              <>
                <p className="text-[13px] font-medium text-blanco-calido truncate">{selectedVideo.title}</p>
                <p className="text-[11px] text-dim truncate">{selectedVideo.channelTitle}</p>
              </>
            ) : (
              <p className="text-[12px] text-muted">Selecciona un video para agregar a la cola</p>
            )}
          </div>
          {selectedVideo && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isInQueue || adding}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-colors ${
                isInQueue
                  ? "bg-escarlata/10 text-escarlata"
                  : "bg-escarlata text-blanco-calido hover:bg-escarlata-2"
              } disabled:opacity-50`}
            >
              {adding ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isInQueue ? (
                <><Check size={14} /> En cola</>
              ) : (
                <><Plus size={14} /> Agregar a la cola</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
