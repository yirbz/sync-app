"use client"

import { useState } from "react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Particles } from "@/components/magicui/particles"
import { MessageSquare, Sparkles } from "lucide-react"

interface ActiveBurst {
  id: number
  text: string
  emoji: string
}

const padPresets = [
  { label: "¡NO MANCHES!", emoji: "😱", color: "from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300" },
  { label: "¡ESTO ES ÉPICO!", emoji: "🔥", color: "from-escarlata/25 to-rojo-profundo/20 border-escarlata/40 text-coral" },
  { label: "MÁS PALOMITAS", emoji: "🍿", color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 text-yellow-300" },
  { label: "JAJAJAJA", emoji: "😂", color: "from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-300" },
  { label: "ME ENCANTA", emoji: "❤️", color: "from-pink-500/20 to-pink-600/10 border-pink-500/40 text-pink-300" },
  { label: "¡SIGUIENTE VIDEO!", emoji: "🎬", color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300" },
]

export function ReactionSoundboard() {
  const [chatList, setChatList] = useState<ActiveBurst[]>([
    { id: 1, text: "¡Bienvenidos a la noche de cine! 🍿", emoji: "👋" },
    { id: 2, text: "Prueba los botones de la botonera flotante de abajo 👇", emoji: "🔥" },
  ])
  const [activeParticleTrigger, setActiveParticleTrigger] = useState(0)

  const triggerPad = (label: string, emoji: string) => {
    setChatList((prev) => [
      ...prev,
      { id: prev.length + 1, text: `${label} ${emoji}`, emoji },
    ])
    setActiveParticleTrigger((prev) => prev + 1)
  }

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto select-none overflow-hidden">
      <Particles key={activeParticleTrigger} quantity={20} color="#FF6B7A" className="opacity-50" />

      <BlurFade delay={0.1}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-coral/15 text-coral border border-coral/30 text-[12px] font-bold uppercase tracking-wider mb-3">
            <span>Experiencia Magic UI #2</span>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight">
            La Botonera de Reacciones en Vivo
          </h2>
          <p className="mt-2 text-[15px] text-muted max-w-lg mx-auto">
            Haz clic en las reacciones para enviar ráfagas de comentarios a la sala en tiempo real.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div className="relative rounded-[32px] border border-white/10 bg-carbon-2 p-6 md:p-8 shadow-elevated space-y-6 overflow-hidden">
          <BorderBeam size={240} duration={9} colorFrom="#FF6B7A" colorTo="#E5283B" />

          {/* Reaction Soundboard Pads Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
            {padPresets.map((pad) => (
              <button
                key={pad.label}
                type="button"
                onClick={() => triggerPad(pad.label, pad.emoji)}
                className={`p-4 rounded-2xl bg-gradient-to-br ${pad.color} border text-left flex items-center justify-between transition-all duration-150 hover:scale-[1.03] active:scale-95 shadow-md group`}
              >
                <div>
                  <span className="text-[20px] block mb-1 group-hover:scale-125 transition-transform">
                    {pad.emoji}
                  </span>
                  <span className="text-[13px] font-extrabold tracking-tight block">
                    {pad.label}
                  </span>
                </div>
                <Sparkles size={16} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Live Chat Stream Display */}
          <div className="rounded-2xl bg-carbon-3/90 border border-white/5 p-4 space-y-3 relative z-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[12px] text-dim">
              <span className="flex items-center gap-1.5 font-semibold text-blanco-calido">
                <MessageSquare size={14} className="text-coral" />
                Stream de Comentarios Sincronizados
              </span>
              <span>Presiona cualquier botón arriba 👆</span>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-none">
              {chatList.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 rounded-xl bg-carbon-2 border border-white/5 text-[13px] flex items-center justify-between animate-fade-in"
                >
                  <span className="font-semibold text-blanco-calido">{chat.text}</span>
                  <span className="text-[18px]">{chat.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  )
}
