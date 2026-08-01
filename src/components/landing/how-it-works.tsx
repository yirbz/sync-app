"use client"

import { useState } from "react"
import { FadeInView } from "@/components/landing/fade-in-view"
import { Tv, Share2, PlayCircle } from "lucide-react"

const steps = [
  {
    id: "01",
    label: "Paso 1",
    title: "Elige tu película o video",
    subtitle: "Conecta tu catálogo de Jellyfin o pega cualquier video de YouTube.",
    description: "Crea una sala limpia en 2 segundos e inicia la lista de reproducción compartida.",
    icon: Tv,
  },
  {
    id: "02",
    label: "Paso 2",
    title: "Envía el código al grupo",
    subtitle: "Tus amigos se unan con un toque desde su navegador favorito.",
    description: "Sin descargas ni registros obligatorios. Pasan el código y entran de inmediato.",
    icon: Share2,
  },
  {
    id: "03",
    label: "Paso 3",
    title: "¡Mírenlo en sincronía!",
    subtitle: "Cuando le das Play, le da Play a todos de forma simultánea.",
    description: "Comenten en vivo, envíen emociones y disfruten de la función como si estuvieran en el mismo sofá.",
    icon: PlayCircle,
  },
]

export function HowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  return (
    <section id="how-it-works" className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="text-left mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carbon-3 text-coral border border-white/10 text-[12px] font-bold uppercase tracking-wider mb-3">
            <span>Tres pasos sencillos</span>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight max-w-xl">
            De la idea al reproductor en menos de un minuto
          </h2>
        </div>
      </FadeInView>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isActive = idx === activeStepIndex
          return (
            <FadeInView key={step.id} delay={idx * 100}>
              <div
                onClick={() => setActiveStepIndex(idx)}
                className={`h-full cursor-pointer rounded-[28px] p-6 border transition-all ${
                  isActive
                    ? "bg-carbon-2 border-escarlata/50 shadow-glow"
                    : "bg-carbon-2/60 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] ${
                    isActive ? "bg-escarlata text-blanco-calido" : "bg-carbon-3 text-muted"
                  }`}>
                    {step.id}
                  </div>
                  <Icon size={20} className={isActive ? "text-escarlata" : "text-dim"} />
                </div>

                <h3 className="text-[18px] font-bold text-blanco-calido mb-2">
                  {step.title}
                </h3>
                <p className="text-[13px] text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </FadeInView>
          )
        })}
      </div>
    </section>
  )
}
