"use client"

import { useState } from "react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Ripple } from "@/components/magicui/ripple"
import { Particles } from "@/components/magicui/particles"
import { Marquee } from "@/components/magicui/marquee"
import { ShinyText } from "@/components/reactbits/shiny-text"
import { SplitText } from "@/components/reactbits/split-text"
import { Play, Pause, Zap, Popcorn, Radio, Check } from "lucide-react"

const movieDemos = [
  {
    id: "cyberpunk",
    title: "Cyberpunk 2077: Edgerunners",
    genre: "Anime / Sci-Fi",
    glowColor: "rgba(229,40,59,0.35)",
    badgeColor: "bg-escarlata",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80",
    quote: "Sincronía activa a 120 FPS",
  },
  {
    id: "cinema",
    title: "Interstellar: Escena de Atraque",
    genre: "Cine 4K / Drama",
    glowColor: "rgba(59,130,246,0.35)",
    badgeColor: "bg-blue-500",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80",
    quote: "Audio Dolby Atmos Sincronizado",
  },
  {
    id: "retro",
    title: "Synthwave Concert Live 1984",
    genre: "Música / Stream",
    glowColor: "rgba(236,72,153,0.35)",
    badgeColor: "bg-pink-500",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
    quote: "Transmisión HLS en Directo",
  },
]

const friendAvatars = [
  { name: "Sofi", color: "bg-escarlata" },
  { name: "Leo", color: "bg-blue-500" },
  { name: "Mateo", color: "bg-emerald-500" },
  { name: "Valen", color: "bg-pink-500" },
  { name: "Dani", color: "bg-purple-500" },
]

export function InteractiveRemoteDemo() {
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [syncPulse, setSyncPulse] = useState(false)
  const [popcornCount, setPopcornCount] = useState<number[]>([])

  const currentMovie = movieDemos[selectedMovieIndex]

  const triggerSyncTest = () => {
    setSyncPulse(true)
    setTimeout(() => setSyncPulse(false), 1400)
  }

  const addPopcorn = () => {
    setPopcornCount((prev) => [...prev, prev.length + 1])
  }

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto select-none overflow-hidden">
      <Particles quantity={25} color="#E5283B" className="opacity-40" />

      <BlurFade delay={0.1}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-escarlata/15 border border-escarlata/30 text-[12px] font-bold uppercase tracking-wider mb-3">
            <ShinyText text="Experiencia Magic UI #1" speed={3} />
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight">
            <SplitText text="Prueba el Control Remoto de la Sala" />
          </h2>
          <p className="mt-2 text-[15px] text-muted max-w-lg mx-auto">
            Toca los botones del control virtual para cambiar la película, lanzar un test de sincronía o tirar palomitas a la pantalla.
          </p>
        </div>
      </BlurFade>

      {/* Marquee Friends Live Status Bar */}
      <BlurFade delay={0.2}>
        <div className="mb-6 py-2 border-y border-white/5 bg-carbon-2/60 backdrop-blur-md">
          <Marquee pauseOnHover repeat={3} className="[--duration:20s]">
            {friendAvatars.map((friend) => (
              <div key={friend.name} className="flex items-center gap-2 px-3 py-1 rounded-full bg-carbon-3 border border-white/5 text-[12px] text-blanco-calido">
                <span className={`w-2 h-2 rounded-full ${friend.color} animate-pulse`} />
                <span className="font-semibold">{friend.name}</span>
                <span className="text-[10px] text-muted">en vivo</span>
              </div>
            ))}
          </Marquee>
        </div>
      </BlurFade>

      <BlurFade delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Cinema Canvas with Magic UI Border Beam */}
          <div className="lg:col-span-8 relative rounded-[32px] border border-white/10 bg-carbon-2 p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <BorderBeam size={220} duration={7} colorFrom="#E5283B" colorTo="#FF6B7A" />

            {/* Dynamic Ambient Backlight Glow based on selected movie */}
            <div
              className="pointer-events-none absolute inset-0 transition-all duration-700 blur-[80px]"
              style={{ background: currentMovie.glowColor }}
            />

            {/* Screen Viewport */}
            <div className="relative rounded-[22px] bg-black aspect-[16/10] overflow-hidden border border-white/10 group">
              <img
                src={currentMovie.image}
                alt={currentMovie.title}
                width={900}
                height={560}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isPlaying ? "opacity-90 scale-100" : "opacity-40 scale-105"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-black/40 pointer-events-none" />

              {/* Animated Popcorn Kernels overlay */}
              {popcornCount.map((id, i) => (
                <div
                  key={id}
                  className="absolute text-[32px] animate-popcorn-float pointer-events-none transition-all duration-700 z-10"
                  style={{
                    left: `${(i * 23) % 75 + 10}%`,
                    top: `${(i * 17) % 50 + 20}%`,
                  }}
                >
                  🍿
                </div>
              ))}

              {/* Sync Pulse Overlay Banner with Magic UI Ripple */}
              {syncPulse && (
                <div className="absolute inset-0 bg-escarlata/20 backdrop-blur-sm flex items-center justify-center animate-fade-in z-20 overflow-hidden">
                  <Ripple mainCircleSize={180} numCircles={5} />
                  <div className="p-4 rounded-2xl bg-carbon-2 border border-escarlata text-center space-y-1 shadow-glow relative z-10">
                    <div className="w-8 h-8 rounded-full bg-escarlata mx-auto flex items-center justify-center text-blanco-calido animate-ping">
                      <Zap size={18} />
                    </div>
                    <p className="text-[14px] font-bold text-blanco-calido">¡Test de Sincronía en Vivo!</p>
                    <p className="text-[11px] font-mono text-emerald-400">4 Dispositivos a 0.00ms de diferencia</p>
                  </div>
                </div>
              )}

              {/* Center Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white uppercase tracking-wider ${currentMovie.badgeColor}`}>
                  {currentMovie.genre}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-blanco-calido">
                  {currentMovie.quote}
                </span>
              </div>

              {/* Play / Pause Scrubber Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/90 z-10 bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-escarlata flex items-center justify-center text-blanco-calido hover:scale-105 active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} className="ml-0.5 fill-white" />}
                </button>
                <div className="flex-1 mx-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-escarlata rounded-full" />
                </div>
                <span>01:15:20</span>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between text-[12px] text-muted">
              <span className="font-semibold text-blanco-calido">{currentMovie.title}</span>
              <span className="text-dim">Toca las opciones del control a la derecha 👉</span>
            </div>
          </div>

          {/* Virtual Smart Remote Control with Magic UI Border Beam */}
          <div className="lg:col-span-4 relative rounded-[32px] border border-white/10 bg-carbon-3/90 p-5 shadow-card backdrop-blur-xl space-y-5 overflow-hidden">
            <BorderBeam size={160} duration={9} colorFrom="#FF6B7A" colorTo="#E5283B" />

            <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-coral" />
                <span className="text-[13px] font-bold text-blanco-calido">Control de la Sala</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                En línea
              </span>
            </div>

            {/* Movie Switcher Buttons */}
            <div className="space-y-2 relative z-10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-dim block">
                Cambiar Película / Stream:
              </label>
              {movieDemos.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMovieIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-[12.5px] font-semibold border transition-all flex items-center justify-between ${
                    idx === selectedMovieIndex
                      ? "bg-escarlata/20 border-escarlata text-blanco-calido shadow-sm"
                      : "bg-carbon-2/60 border-white/5 text-muted hover:text-blanco-calido hover:bg-carbon-2"
                  }`}
                >
                  <span className="truncate">{m.title}</span>
                  {idx === selectedMovieIndex && <Check size={14} className="text-escarlata shrink-0 ml-1" />}
                </button>
              ))}
            </div>

            {/* Fun Interactive Triggers */}
            <div className="space-y-2 pt-2 border-t border-white/5 relative z-10">
              <label className="text-[11px] font-bold uppercase tracking-wider text-dim block">
                Acciones de la Noche:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={addPopcorn}
                  className="p-3 rounded-xl bg-carbon-2 hover:bg-escarlata text-blanco-calido text-[12px] font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Popcorn size={16} />
                  <span>Tirar Palomitas</span>
                </button>

                <button
                  type="button"
                  onClick={triggerSyncTest}
                  className="p-3 rounded-xl bg-carbon-2 hover:bg-escarlata text-blanco-calido text-[12px] font-semibold border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Zap size={16} className="text-coral" />
                  <span>Test Sync</span>
                </button>
              </div>
            </div>

            <style jsx global>{`
              @keyframes popcorn-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-14px); }
              }
              .animate-popcorn-float {
                animation: popcorn-float 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
              }
            `}</style>
          </div>
        </div>
      </BlurFade>
    </section>
  )
}
