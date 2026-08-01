"use client"

import { useState } from "react"
import { FadeInView } from "@/components/landing/fade-in-view"
import { TagBadge } from "@/components/landing/tag-badge"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "¿Cómo funciona la sincronización en tiempo real?",
    a: "Sync transmite mensajes de tiempo vía WebSockets. Cuando el Host presiona reproducir, pausar o buscar en la línea de tiempo, todos los reproductores ajustan su posición exacta con menos de 15ms de diferencia.",
  },
  {
    q: "¿Puedo conectar mi propio servidor de Jellyfin?",
    a: "Sí. En los planes Plus y Studio agregas la dirección de tu servidor y tu token de usuario para explorar y reproducir tu biblioteca compartida directamente en la sala.",
  },
  {
    q: "¿Es necesario que todos mis amigos tengan una cuenta?",
    a: "No. Tus amigos pueden entrar a la sala usando un código de invitación o enlace directo sin necesidad de completar un registro previo.",
  },
  {
    q: "¿Qué contenidos se pueden ver en Sync?",
    a: "Soporta videos de YouTube, películas y series de Jellyfin, transmisiones en vivo HLS, archivos de video MP4/WebM y contenido de Google Drive.",
  },
  {
    q: "¿Funciona en teléfonos móviles y tablets?",
    a: "Sí. La aplicación es totalmente responsiva y está optimizada para navegadores móviles en smartphones, tablets, laptops y Smart TVs.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="relative px-4 py-20 md:px-6 md:py-24 max-w-4xl mx-auto">
      <FadeInView>
        <div className="text-left mb-10">
          <div className="mb-3">
            <TagBadge variant="default">FAQs</TagBadge>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-blanco-calido max-w-xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-[15px] md:text-[16px] leading-relaxed text-muted max-w-lg">
            Respuestas claras a las dudas más habituales sobre las salas de Sync.
          </p>
        </div>
      </FadeInView>

      <div className="space-y-3">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i
          const contentId = `faq-content-${i}`
          return (
            <FadeInView key={item.q} delay={i * 60}>
              <div className="rounded-[20px] border border-white/10 bg-carbon-2/80 overflow-hidden shadow-card backdrop-blur-xl transition-all hover:border-white/20">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-[15px] md:text-[16px] text-blanco-calido focus-visible:ring-2 focus-visible:ring-escarlata focus-visible:outline-none"
                >
                  <span>{item.q}</span>
                  <div
                    className={`w-9 h-9 rounded-full bg-carbon-3 border border-white/10 flex items-center justify-center text-blanco-calido shrink-0 transition-transform ${
                      isOpen ? "rotate-180 bg-escarlata border-escarlata" : ""
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    className="px-5 pb-5 text-[14px] text-muted leading-relaxed border-t border-white/5 pt-3"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            </FadeInView>
          )
        })}
      </div>
    </section>
  )
}
