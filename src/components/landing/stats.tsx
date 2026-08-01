"use client"

import { FadeInView } from "@/components/landing/fade-in-view"
import { TagBadge, DoubleChevron } from "@/components/landing/tag-badge"

const stats = [
  {
    value: "< 15 ms",
    label: "Latencia de sincronización en tiempo real",
  },
  {
    value: "50 k+",
    label: "Horas de video reproducidas en conjunto",
  },
  {
    value: "99.9 %",
    label: "Disponibilidad en reproducción multi-dispositivo",
  },
]

export function Stats() {
  return (
    <section id="metrics" className="relative px-4 py-20 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="text-left mb-10">
          <div className="mb-3">
            <TagBadge variant="default">Metrics</TagBadge>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-blanco-calido max-w-xl">
            Rendimiento diseñado para la mejor experiencia
          </h2>
        </div>
      </FadeInView>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <FadeInView key={stat.label} delay={i * 100}>
            <div className="rounded-[24px] border border-white/10 bg-carbon-2/80 p-6 md:p-8 flex items-center justify-between shadow-card backdrop-blur-xl hover:border-escarlata/30 transition-all group">
              <div>
                <span className="text-[36px] md:text-[44px] font-extrabold text-blanco-calido tracking-tight leading-none block">
                  {stat.value}
                </span>
                <span className="mt-2 text-[13px] text-muted leading-snug block max-w-[180px]">
                  {stat.label}
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-carbon-3 border border-white/10 flex items-center justify-center text-blanco-calido group-hover:bg-escarlata group-hover:border-escarlata transition-all shrink-0">
                <DoubleChevron />
              </div>
            </div>
          </FadeInView>
        ))}
      </div>
    </section>
  )
}
