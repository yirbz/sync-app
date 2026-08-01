"use client"

import { FadeInView } from "@/components/landing/fade-in-view"
import { ShieldCheck, Zap, Lock, Popcorn } from "lucide-react"

const principles = [
  {
    icon: Lock,
    title: "Sin registros molestos",
    description: "Ingresa con un apodo o como invitado. Nadie necesita crear una cuenta corporativa para ver un video.",
  },
  {
    icon: Zap,
    title: "Latencia ultrabaja (<10ms)",
    description: "La sincronía se realiza punto a punto mediante WebSockets ligeros. Play, pausa y avance instantáneos.",
  },
  {
    icon: ShieldCheck,
    title: "Libre de publicidad",
    description: "Sin anuncios emergentes, sin banners invasivos ni rastreadores de terceros. Solo la pantalla y tu grupo.",
  },
  {
    icon: Popcorn,
    title: "Salas a tu medida",
    description: "Crea salas efímeras para un video rápido o salas guardadas para las noches de cine fijas de los fines de semana.",
  },
]

export function PrivacyManifesto() {
  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-[#211014] via-[#170b0d] to-[#0f0607] p-8 md:p-12 shadow-elevated">
          <div className="max-w-xl mb-10 text-left">
            <span className="text-[12px] font-bold text-coral uppercase tracking-wider block mb-2">
              Filosofía casera & privada
            </span>
            <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight">
              Diseñado para el confort de tus amigos
            </h2>
            <p className="mt-2 text-[15px] text-muted leading-relaxed">
              Sync nació para resolver un problema simple: ver videos juntos en casa sin lidiar con software pesado ni suscripciones complejas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => {
              const Icon = p.icon
              return (
                <FadeInView key={p.title} delay={i * 80}>
                  <div className="space-y-2.5 p-4 rounded-2xl bg-carbon-3/60 border border-white/5">
                    <div className="w-9 h-9 rounded-xl bg-escarlata/15 text-escarlata flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-[15px] font-bold text-blanco-calido">{p.title}</h3>
                    <p className="text-[12.5px] text-muted leading-relaxed">{p.description}</p>
                  </div>
                </FadeInView>
              )
            })}
          </div>
        </div>
      </FadeInView>
    </section>
  )
}
