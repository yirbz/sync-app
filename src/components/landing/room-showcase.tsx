"use client"

import { useState, useRef } from "react"
import { FadeInView } from "@/components/landing/fade-in-view"
import { Play, Pause, MessageSquare, Sparkles, Send } from "lucide-react"

const sampleMessages = [
  { sender: "Mateo", text: "¡Traigan palomitas que ya empezó! 🍿", color: "text-blue-400", avatar: "M" },
  { sender: "Lucía", text: "¡Nooo esa escena fue increíble! 🔥", color: "text-coral", avatar: "L" },
  { sender: "Santi", text: "Espérenme 10 segundos voy por agua 🥤", color: "text-emerald-400", avatar: "S" },
]

export function RoomShowcase() {
  const [isPlaying, setIsPlaying] = useState(true)
  const reactionCounter = useRef(100)
  const [reactions, setReactions] = useState<{ id: number; emoji: string; left: number }[]>([
    { id: 1, emoji: "🍿", left: 20 },
    { id: 2, emoji: "🔥", left: 45 },
    { id: 3, emoji: "❤️", left: 75 },
  ])
  const [messages, setMessages] = useState(sampleMessages)
  const [chatInput, setChatInput] = useState("")

  const triggerReaction = (emoji: string) => {
    reactionCounter.current += 1
    const newId = reactionCounter.current
    const randomLeft = (newId * 37) % 65 + 15
    setReactions((prev) => [...prev, { id: newId, emoji, left: randomLeft }])
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newId))
    }, 2000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    setMessages((prev) => [
      ...prev,
      { sender: "Tú", text: chatInput.trim(), color: "text-escarlata", avatar: "T" },
    ])
    setChatInput("")
  }

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-escarlata/15 text-escarlata border border-escarlata/30 text-[12px] font-bold uppercase tracking-wider mb-3">
            <span>Simulador de Sala en Vivo</span>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight">
            Así se siente una noche de cine en Sync
          </h2>
          <p className="mt-2 text-[15px] text-muted max-w-lg mx-auto">
            Interactúa con la pantalla: dale Play/Pausa, envía reacciones y siente la sincronía.
          </p>
        </div>
      </FadeInView>

      {/* Simulated Living Room Cinema Screen */}
      <FadeInView delay={150}>
        <div className="relative rounded-[32px] border border-white/10 bg-carbon-2/95 p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_30px_rgba(229,40,59,0.15)] overflow-hidden">
          {/* Ambient Screen Glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-escarlata/10 via-transparent to-transparent opacity-60" />

          {/* Top Bar inside Room */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-[13px] font-bold text-blanco-calido">Sala: &ldquo;Maratón de Viernes 🍿&rdquo;</p>
                <p className="text-[11px] text-dim">4 Amigos conectados · 1080p Full HD</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-escarlata border-2 border-carbon-2 text-[10px] font-bold flex items-center justify-center">T</div>
                <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-carbon-2 text-[10px] font-bold flex items-center justify-center">M</div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-carbon-2 text-[10px] font-bold flex items-center justify-center">S</div>
                <div className="w-7 h-7 rounded-full bg-coral border-2 border-carbon-2 text-[10px] font-bold flex items-center justify-center">L</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* Video Player Display (2 Cols) */}
            <div className="lg:col-span-2 relative rounded-[20px] bg-black overflow-hidden border border-white/10 aspect-[16/10] flex flex-col justify-between group">
              <img
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80"
                alt="Movie Frame"
                width={900}
                height={560}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
                  isPlaying ? "opacity-90" : "opacity-40"
                }`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Floating Animated Emojis */}
              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="absolute bottom-16 text-[28px] animate-pulse pointer-events-none transition-all duration-1000"
                  style={{ left: `${r.left}%` }}
                >
                  {r.emoji}
                </div>
              ))}

              {/* Center Play/Pause Overlay */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-escarlata/90 hover:bg-escarlata text-blanco-calido flex items-center justify-center shadow-glow transition-transform hover:scale-110 active:scale-95"
                aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
              >
                {isPlaying ? <Pause size={26} fill="white" /> : <Play size={26} className="ml-1 fill-white" />}
              </button>

              {/* Video Scrubber & Sync Timestamps */}
              <div className="relative z-10 p-4 mt-auto space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-escarlata" />
                    <span>01:24:10</span>
                  </span>
                  <span>02:15:00</span>
                </div>

                {/* Progress Bar with Friend Avatars */}
                <div className="relative w-full h-2 bg-white/20 rounded-full overflow-visible">
                  <div className="h-full w-3/5 bg-escarlata rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md ring-2 ring-escarlata" />
                  </div>

                  {/* Friend Avatars along Scrubber */}
                  <div className="absolute -top-3 left-[58%] -translate-x-1/2 w-5 h-5 rounded-full bg-blue-500 text-[9px] font-bold flex items-center justify-center border border-white" title="Mateo en 01:24:10">
                    M
                  </div>
                  <div className="absolute -top-3 left-[59%] -translate-x-1/2 w-5 h-5 rounded-full bg-coral text-[9px] font-bold flex items-center justify-center border border-white" title="Lucía en 01:24:10">
                    L
                  </div>
                </div>

                {/* Interactive Emoji Reaction Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted font-medium">Reaccionar:</span>
                    {["🍿", "🔥", "❤️", "😱", "👏"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => triggerReaction(emoji)}
                        className="w-8 h-8 rounded-full bg-carbon-3/80 hover:bg-escarlata text-[15px] flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/10"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-coral font-semibold flex items-center gap-1">
                    <Sparkles size={13} />
                    <span>Sincronizado • 12ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Stream (1 Col) */}
            <div className="rounded-[20px] bg-carbon-3/80 border border-white/5 p-3.5 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-blanco-calido flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-coral" />
                    Chat de la sala
                  </span>
                  <span className="text-[10px] text-dim">En vivo</span>
                </div>

                <div className="py-3 space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-none">
                  {messages.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-2xl bg-carbon-2/90 border border-white/5 text-[12px] space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${m.color}`}>{m.sender}</span>
                        <span className="text-[9px] text-dim">Ahora</span>
                      </div>
                      <p className="text-blanco-calido/90 leading-snug">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 rounded-full bg-carbon-2 px-3.5 py-2 text-[12px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-8 h-8 rounded-full bg-escarlata text-blanco-calido flex items-center justify-center disabled:opacity-40 shrink-0"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </FadeInView>
    </section>
  )
}
