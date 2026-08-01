"use client"

import { useState } from "react"
import Link from "next/link"
import { FadeInView } from "@/components/landing/fade-in-view"
import { TagBadge, DoubleChevron } from "@/components/landing/tag-badge"

const plans = [
  {
    name: "Plan Esencial",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Ideal para parejas y grupos pequeños que quieren ver videos de YouTube y links públicos.",
    popular: false,
    cta: "Comenzar gratis",
    features: [
      "Sincronización en HD 1080p",
      "Hasta 4 participantes por sala",
      "Chat y reacciones en vivo",
      "Soporte para YouTube y MP4",
      "Salas temporales ilimitadas",
    ],
  },
  {
    name: "Plan Plus",
    priceMonthly: 5,
    priceYearly: 4,
    description: "Perfecto para comunidades y amigos cinéfilos que buscan integración Jellyfin y salas de alta capacidad.",
    popular: true,
    cta: "Obtener Plan Plus",
    features: [
      "Todo en el Plan Esencial",
      "Hasta 20 participantes por sala",
      "Conexión a Servidores Jellyfin",
      "Sincronización en 4K Ultra HD",
      "Salas permanentes personalizadas",
      "Baja latencia prioritaria (<20ms)",
    ],
  },
  {
    name: "Plan Studio / Server",
    priceMonthly: 12,
    priceYearly: 9.5,
    description: "Diseñado para creadores de contenido, streamers y administradores de servidores dedicados.",
    popular: false,
    cta: "Obtener Plan Studio",
    features: [
      "Todo en el Plan Plus",
      "Participantes ilimitados en sala",
      "Multi-servidor Jellyfin simultáneo",
      "Integración de bots & webhooks",
      "Control de moderación avanzado",
      "Soporte técnico prioritario 24/7",
    ],
  },
]

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="relative px-4 py-20 md:px-6 md:py-28 max-w-5xl mx-auto">
      <FadeInView>
        <div className="text-left mb-12">
          <div className="mb-3">
            <TagBadge variant="default">Pricing</TagBadge>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-blanco-calido max-w-xl">
            Elige el plan ideal para tus salas de video
          </h2>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed text-muted max-w-lg">
            Empieza gratis hoy mismo y escala según las necesidades de tu grupo o servidor.
          </p>

          {/* Billing Toggle Bar (Framer Style: Monthly / Yearly SAVE 20%) */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-carbon-2 border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all ${
                !isYearly
                  ? "bg-blanco-calido text-carbon shadow-md"
                  : "text-muted hover:text-blanco-calido"
              }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-all ${
                isYearly
                  ? "bg-blanco-calido text-carbon shadow-md"
                  : "text-muted hover:text-blanco-calido"
              }`}
            >
              <span>Anual</span>
              <span className="px-2 py-0.5 rounded-full bg-escarlata text-blanco-calido text-[10px] font-extrabold uppercase tracking-wider">
                AHORRA 20%
              </span>
            </button>
          </div>
        </div>
      </FadeInView>

      {/* Tier Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((plan, i) => {
          const price = isYearly ? plan.priceYearly : plan.priceMonthly
          return (
            <FadeInView key={plan.name} delay={i * 100}>
              <div
                className={`h-full rounded-[28px] p-6 md:p-8 flex flex-col justify-between border transition-all ${
                  plan.popular
                    ? "bg-gradient-to-b from-[#2a1318] via-[#1f1113] to-[#140a0c] border-escarlata/40 shadow-[0_10px_30px_rgba(229,40,59,0.15)] relative"
                    : "bg-carbon-2/80 border-white/10 hover:border-white/20"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-escarlata text-blanco-calido text-[11px] font-bold tracking-wider uppercase shadow-glow">
                    Más Popular
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-[14px] font-semibold text-muted">{plan.name}</p>

                  <div className="flex items-baseline gap-1">
                    <span className="text-[38px] md:text-[44px] font-extrabold text-blanco-calido tracking-tight">
                      ${price}
                    </span>
                    <span className="text-[14px] text-dim">/ mes</span>
                  </div>

                  <p className="text-[13px] text-muted leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>

                  <div className="pt-2">
                    <Link href="/auth">
                      <button
                        type="button"
                        className={`w-full py-3 px-4 rounded-full text-[14px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          plan.popular
                            ? "bg-escarlata hover:bg-escarlata-2 text-blanco-calido shadow-glow active:scale-95"
                            : "bg-blanco-calido hover:bg-white text-carbon font-bold active:scale-95"
                        }`}
                      >
                        <span>{plan.cta}</span>
                        <DoubleChevron />
                      </button>
                    </Link>
                  </div>

                  <hr className="my-4 border-white/5" />

                  {/* Feature Checklist */}
                  <div className="space-y-2.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[12.5px] text-blanco-calido/90">
                        <span className="text-escarlata text-[14px] shrink-0">✦</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInView>
          )
        })}
      </div>
    </section>
  )
}
