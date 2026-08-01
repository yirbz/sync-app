"use client"

import { useState } from "react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Marquee } from "@/components/magicui/marquee"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import { Tv, Video, Check, Plus, Search, Sparkles, ShieldCheck } from "lucide-react"

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

const jellyfinMedia = [
  { id: "1", title: "Dune: Parte Dos", resolution: "4K HDR", duration: "2h 46m", cover: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80" },
  { id: "2", title: "Spider-Man: Across Spider-Verse", resolution: "1080p 60fps", duration: "2h 20m", cover: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=400&q=80" },
  { id: "3", title: "Cyberpunk 2077 Anime", resolution: "4K Ultra", duration: "10 Episodios", cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80" },
  { id: "4", title: "Interstellar 4K Remaster", resolution: "Dolby Atmos", duration: "2h 49m", cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80" },
]

const youtubePresets = [
  { id: "y1", title: "Tráiler Oficial GTA 6 (4K 60FPS)", channel: "Rockstar Games", duration: "01:31" },
  { id: "y2", title: "Lofi Hip Hop Radio — Beats to Relax/Study", channel: "Lofi Girl", duration: "EN VIVO 🔴" },
  { id: "y3", title: "Synthwave Live DJ Concert 2024", channel: "Cyber Sound", duration: "45:12" },
]

export function MediaHubDemo() {
  const [activeTab, setActiveTab] = useState<"jellyfin" | "youtube" | "direct">("jellyfin")
  const [addedQueue, setAddedQueue] = useState<string[]>([])

  const toggleQueueItem = (title: string) => {
    setAddedQueue((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto select-none overflow-hidden">
      <BlurFade delay={0.1}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[12px] font-bold uppercase tracking-wider mb-3">
            <span>Experiencia Magic UI #3</span>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight">
            Tus Fuentes de Video en Un Solo Lugar
          </h2>
          <p className="mt-2 text-[15px] text-muted max-w-lg mx-auto">
            Selecciona la fuente de medios para simular cómo se añade contenido a la cola de reproducción en tiempo real.
          </p>
        </div>
      </BlurFade>

      {/* Marquee Header Banner */}
      <BlurFade delay={0.15}>
        <div className="mb-6 py-2 border-y border-white/5 bg-carbon-2/40 backdrop-blur-md">
          <Marquee pauseOnHover repeat={4} className="[--duration:25s]">
            {jellyfinMedia.map((media) => (
              <div key={media.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-3 border border-white/5 text-[12px] text-blanco-calido">
                <Tv size={14} className="text-coral" />
                <span className="font-semibold">{media.title}</span>
                <span className="text-[10px] text-emerald-400 font-mono">{media.resolution}</span>
              </div>
            ))}
          </Marquee>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        {/* Source Selector Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("jellyfin")}
            className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold flex items-center gap-2 border transition-all ${
              activeTab === "jellyfin"
                ? "bg-escarlata border-escarlata text-blanco-calido shadow-glow"
                : "bg-carbon-2 border-white/10 text-muted hover:text-blanco-calido"
            }`}
          >
            <Tv size={17} />
            <span>Jellyfin Casero</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("youtube")}
            className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold flex items-center gap-2 border transition-all ${
              activeTab === "youtube"
                ? "bg-escarlata border-escarlata text-blanco-calido shadow-glow"
                : "bg-carbon-2 border-white/10 text-muted hover:text-blanco-calido"
            }`}
          >
            <YoutubeIcon className="text-white" />
            <span>YouTube en Grupo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("direct")}
            className={`px-5 py-2.5 rounded-full text-[13.5px] font-bold flex items-center gap-2 border transition-all ${
              activeTab === "direct"
                ? "bg-escarlata border-escarlata text-blanco-calido shadow-glow"
                : "bg-carbon-2 border-white/10 text-muted hover:text-blanco-calido"
            }`}
          >
            <Video size={17} />
            <span>Link Directo (MP4/HLS)</span>
          </button>
        </div>

        {/* Tab Content Display with Magic UI Border Beam */}
        <div className="relative rounded-[32px] border border-white/10 bg-carbon-2 p-6 md:p-8 shadow-elevated overflow-hidden">
          <BorderBeam size={220} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />

          {activeTab === "jellyfin" && (
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span className="text-[14px] font-bold text-blanco-calido">
                    Servidor Jellyfin Vinculado
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">
                  <DecryptedText text="sync-app.duckdns.org" speed={35} />
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {jellyfinMedia.map((m) => {
                  const isAdded = addedQueue.includes(m.title)
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleQueueItem(m.title)}
                      className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                        isAdded
                          ? "border-escarlata shadow-glow scale-[1.02]"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={m.cover}
                        alt={m.title}
                        width={400}
                        height={260}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent p-3 flex flex-col justify-end">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-escarlata text-white w-max mb-1">
                          {m.resolution}
                        </span>
                        <p className="text-[13px] font-bold text-blanco-calido leading-tight truncate">
                          {m.title}
                        </p>
                        <span className="text-[11px] text-muted">{m.duration}</span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isAdded ? "bg-escarlata text-white" : "bg-black/60 text-white/80"
                        }`}>
                          {isAdded ? <Check size={14} /> : <Plus size={14} />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "youtube" && (
            <div className="space-y-4 relative z-10">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type="text"
                  readOnly
                  value="Búsqueda instantánea de YouTube sincronizada..."
                  className="w-full rounded-2xl bg-carbon-3 pl-11 pr-4 py-3 text-[13.5px] text-blanco-calido outline-none border border-white/10"
                />
              </div>

              <div className="space-y-2 pt-2">
                {youtubePresets.map((y) => {
                  const isAdded = addedQueue.includes(y.title)
                  return (
                    <div
                      key={y.id}
                      onClick={() => toggleQueueItem(y.title)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isAdded
                          ? "bg-escarlata/20 border-escarlata shadow-sm"
                          : "bg-carbon-3/60 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                          <YoutubeIcon />
                        </div>
                        <div>
                          <p className="text-[13.5px] font-bold text-blanco-calido">{y.title}</p>
                          <span className="text-[11px] text-muted">{y.channel} · {y.duration}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1 transition-all ${
                          isAdded ? "bg-escarlata text-white" : "bg-carbon-2 text-muted hover:text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} />
                            <span>En la cola</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Añadir</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "direct" && (
            <div className="space-y-4 text-center py-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-escarlata/20 text-escarlata mx-auto flex items-center justify-center">
                <Video size={24} />
              </div>
              <h3 className="text-[17px] font-bold text-blanco-calido">
                Pega cualquier enlace de video MP4, HLS o Dash
              </h3>
              <p className="text-[13px] text-muted max-w-md mx-auto">
                ¿Tienes un video guardado en tu servidor local o en la nube? Pega la URL directa y Sync se encarga del resto.
              </p>
              <div className="max-w-md mx-auto relative">
                <input
                  type="text"
                  readOnly
                  value="https://mi-servidor-casero.local/video.mp4"
                  className="w-full rounded-2xl bg-carbon-3 px-4 py-3 text-[13px] font-mono text-emerald-400 border border-white/10 outline-none text-center"
                />
              </div>
            </div>
          )}

          {/* Queue Indicator Footer */}
          {addedQueue.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[12px] relative z-10">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={14} />
                {addedQueue.length} elemento(s) listos en la cola
              </span>
              <button
                type="button"
                onClick={() => setAddedQueue([])}
                className="text-dim hover:text-blanco-calido underline"
              >
                Limpiar cola
              </button>
            </div>
          )}
        </div>
      </BlurFade>
    </section>
  )
}
