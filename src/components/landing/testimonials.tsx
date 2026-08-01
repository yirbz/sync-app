"use client"

import { FadeInView } from "@/components/landing/fade-in-view"
import { TagBadge } from "@/components/landing/tag-badge"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Carlos & Valentina",
    role: "Pareja a distancia",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    text: "Sync cambió por completo cómo vemos nuestras series favoritas. Vivimos en diferentes países pero ver anime en sincronía perfecta nos hace sentir en la misma sala.",
    rating: 5,
  },
  {
    name: "Comunidad StreamHub",
    role: "Grupo de 15+ amigos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    text: "Conectar nuestro servidor de Jellyfin fue facilísimo. Ahora hacemos noches de cine todos los viernes sin que nadie se quede fuera.",
    rating: 5,
  },
  {
    name: "Javier R.",
    role: "Usuario Pro",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    text: "La latencia es prácticamente cero. El chat en vivo y las reacciones le dan un toque genial a cada video.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="relative px-4 py-20 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="text-left mb-12">
          <div className="mb-3">
            <TagBadge variant="default">Testimonials</TagBadge>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-blanco-calido max-w-xl">
            Lo que dicen quienes usan Sync
          </h2>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed text-muted max-w-lg">
            Historias reales de personas que comparten películas y series cada semana.
          </p>
        </div>
      </FadeInView>

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <FadeInView key={t.name} delay={i * 100}>
            <div className="h-full rounded-[24px] border border-white/10 bg-carbon-2/80 p-6 flex flex-col justify-between shadow-card backdrop-blur-xl hover:border-escarlata/30 transition-all">
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={14} fill="currentColor" />
                  ))}
                </div>

                <p className="text-[13.5px] text-blanco-calido/90 leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <p className="text-[13px] font-bold text-blanco-calido">{t.name}</p>
                  <p className="text-[11px] text-dim">{t.role}</p>
                </div>
              </div>
            </div>
          </FadeInView>
        ))}
      </div>
    </section>
  )
}
