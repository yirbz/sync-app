"use client"

import { FadeInView } from "@/components/landing/fade-in-view"
import { TagBadge, DoubleChevron } from "@/components/landing/tag-badge"
import { PhoneMockup } from "@/components/landing/phone-mockup"
import { Play, Tv, CheckCircle, Zap } from "lucide-react"

export function Features() {
  return (
    <section id="features" className="relative px-4 py-20 md:px-6 md:py-28 max-w-5xl mx-auto">
      {/* Background Subtle Ambient Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-0 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-escarlata/5 blur-[120px]" />
      </div>

      <FadeInView>
        <div className="text-left mb-12">
          <div className="mb-3">
            <TagBadge variant="default">Features</TagBadge>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-blanco-calido max-w-xl">
            Todo lo que necesitas para estar en sincronía
          </h2>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed text-muted max-w-lg">
            Herramientas potentes diseñadas para ofrecer salas de video fluidas, intuitivas y divertidas.
          </p>
        </div>
      </FadeInView>

      {/* Feature Stack Cards (Framer App Minimal Style) */}
      <div className="space-y-10">
        {/* Feature Card 1 */}
        <FadeInView delay={100}>
          <div className="rounded-[28px] border border-white/10 bg-carbon-2/80 p-6 md:p-10 shadow-card backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-escarlata/30 transition-all">
            <div className="flex-1 space-y-4 max-w-md">
              <TagBadge variant="escarlata">01 - Sincronización en tiempo real</TagBadge>
              <h3 className="text-[24px] md:text-[28px] font-bold text-blanco-calido leading-tight">
                Control simultáneo para todos en la sala
              </h3>
              <p className="text-[14px] md:text-[15px] text-muted leading-relaxed">
                Cuando alguien presiona reproducir, pausar o adelanta 10 segundos, todos los dispositivos responden en milisegundos.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-carbon-3 border border-white/10 flex items-center justify-center text-blanco-calido hover:bg-escarlata hover:border-escarlata transition-all group-hover:scale-105"
                  aria-label="Ver detalle"
                >
                  <DoubleChevron />
                </button>
              </div>
            </div>

            {/* Embedded Phone Mockup 1 */}
            <div className="w-full md:w-[280px] shrink-0">
              <PhoneMockup className="w-[260px] sm:w-[270px]">
                <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-carbon-3 to-carbon-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-coral flex items-center gap-1">
                        <Zap size={12} /> Estado de Sync
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                        Latencia: 12ms
                      </span>
                    </div>

                    <div className="rounded-2xl bg-carbon p-3 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium text-blanco-calido">Reproductor Host</span>
                        <span className="text-[10px] text-dim font-mono">01:42 / 12:00</span>
                      </div>
                      <div className="w-full h-1.5 bg-carbon-3 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-escarlata rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {["Carlos (Host)", "Elena", "Santiago", "Valentina"].map((name) => (
                        <div key={name} className="flex items-center justify-between p-2 rounded-xl bg-carbon-3/60 text-[11px]">
                          <span className="font-medium text-blanco-calido">{name}</span>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle size={10} /> En tiempo real
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </FadeInView>

        {/* Feature Card 2 */}
        <FadeInView delay={200}>
          <div className="rounded-[28px] border border-white/10 bg-carbon-2/80 p-6 md:p-10 shadow-card backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-escarlata/30 transition-all">
            <div className="flex-1 space-y-4 max-w-md">
              <TagBadge variant="coral">Chat & Reacciones - 02</TagBadge>
              <h3 className="text-[24px] md:text-[28px] font-bold text-blanco-calido leading-tight">
                Conversaciones y comentarios al instante
              </h3>
              <p className="text-[14px] md:text-[15px] text-muted leading-relaxed">
                Comenta las mejores escenas, envía emojis animados y no te pierdas la reacción de ningún miembro del grupo.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-carbon-3 border border-white/10 flex items-center justify-center text-blanco-calido hover:bg-escarlata hover:border-escarlata transition-all group-hover:scale-105"
                  aria-label="Ver detalle"
                >
                  <DoubleChevron />
                </button>
              </div>
            </div>

            {/* Embedded Phone Mockup 2 */}
            <div className="w-full md:w-[280px] shrink-0">
              <PhoneMockup className="w-[260px] sm:w-[270px]">
                <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-carbon-3 to-carbon">
                  <div className="text-center pb-2 border-b border-white/5">
                    <p className="text-[12px] font-bold text-blanco-calido">Chat de la Sala</p>
                    <p className="text-[10px] text-dim">4 participantes activos</p>
                  </div>

                  <div className="space-y-2 py-3">
                    <div className="p-2.5 rounded-2xl bg-escarlata/15 border border-escarlata/20 text-[11px] self-end">
                      <p className="text-[10px] font-bold text-coral">Tú</p>
                      <p className="text-blanco-calido">¡Miren ese giro dramático! 😱</p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-carbon-3 border border-white/5 text-[11px]">
                      <p className="text-[10px] font-bold text-blue-400">Sofía</p>
                      <p className="text-muted">No me lo esperaba para nada!! 🔥</p>
                    </div>

                    <div className="flex gap-1.5 justify-center pt-2">
                      {["🔥", "❤️", "😱", "👏"].map((emoji) => (
                        <span key={emoji} className="px-2.5 py-1 rounded-full bg-carbon-3 text-[13px] border border-white/10 shadow-sm">
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </FadeInView>

        {/* Feature Card 3 */}
        <FadeInView delay={300}>
          <div className="rounded-[28px] border border-white/10 bg-carbon-2/80 p-6 md:p-10 shadow-card backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-escarlata/30 transition-all">
            <div className="flex-1 space-y-4 max-w-md">
              <TagBadge variant="default">03 - Jellyfin & YouTube</TagBadge>
              <h3 className="text-[24px] md:text-[28px] font-bold text-blanco-calido leading-tight">
                Biblioteca personal e ilimitada
              </h3>
              <p className="text-[14px] md:text-[15px] text-muted leading-relaxed">
                Navega y reproduce contenido directamente desde tu servidor de medios Jellyfin o busca cualquier video de YouTube dentro de la app.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-carbon-3 border border-white/10 flex items-center justify-center text-blanco-calido hover:bg-escarlata hover:border-escarlata transition-all group-hover:scale-105"
                  aria-label="Ver detalle"
                >
                  <DoubleChevron />
                </button>
              </div>
            </div>

            {/* Embedded Phone Mockup 3 */}
            <div className="w-full md:w-[280px] shrink-0">
              <PhoneMockup className="w-[260px] sm:w-[270px]">
                <div className="p-3 flex-1 flex flex-col justify-between bg-carbon-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-[11px] font-bold text-blanco-calido">Mi Catálogo Jellyfin</span>
                      <span className="text-[10px] text-coral font-medium">Conectado</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-carbon-3 p-1.5 border border-white/5 text-[10px]">
                        <div className="aspect-[3/2] bg-black/40 rounded-lg overflow-hidden mb-1 flex items-center justify-center">
                          <Tv size={16} className="text-coral" />
                        </div>
                        <p className="font-bold text-blanco-calido truncate">Stranger Series</p>
                        <p className="text-dim">4K HDR</p>
                      </div>

                      <div className="rounded-xl bg-carbon-3 p-1.5 border border-white/5 text-[10px]">
                        <div className="aspect-[3/2] bg-black/40 rounded-lg overflow-hidden mb-1 flex items-center justify-center">
                          <Play size={16} className="text-escarlata" />
                        </div>
                        <p className="font-bold text-blanco-calido truncate">Cyberpunk 2077</p>
                        <p className="text-dim">YouTube 1080p</p>
                      </div>
                    </div>
                  </div>
                </div>
              </PhoneMockup>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  )
}
