"use client"

import { FadeInView } from "@/components/landing/fade-in-view"
import { Tv, Film } from "lucide-react"

const sources = [
  {
    icon: Tv,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    title: "Tu Servidor Jellyfin",
    description: "Conecta tu catálogo personal de películas y series desde tu red local o VPN. Toda tu colección accesible para tu grupo.",
    tag: "Servidor local / NAS",
  },
  {
    customIcon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} className="text-escarlata">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>
      </svg>
    ),
    bgColor: "bg-escarlata/10",
    borderColor: "border-escarlata/20",
    title: "YouTube en Grupo",
    description: "Busca videos directamente desde la app o pega cualquier enlace de YouTube para agregarlo a la cola de reproducción compartida.",
    tag: "Videos & Streams",
  },
  {
    icon: Film,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    title: "Videos Directos HLS / MP4",
    description: "Transmite archivos de video directos desde enlaces web públicos o almacenamiento remoto sin conversión ni demoras.",
    tag: "HLS / MP4 / WebM",
  },
]

export function MediaSources() {
  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="text-left mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carbon-3 text-coral border border-white/10 text-[12px] font-bold uppercase tracking-wider mb-3">
            <span>¿Qué podemos ver hoy?</span>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight max-w-xl">
            Todo tu contenido favorito en un solo lugar
          </h2>
          <p className="mt-2 text-[15px] text-muted max-w-lg">
            No necesitas cambiar de aplicación. Elige lo que quieres ver y dale Play.
          </p>
        </div>
      </FadeInView>

      <div className="grid gap-6 md:grid-cols-3">
        {sources.map((src) => {
          const Icon = src.icon
          return (
            <FadeInView key={src.title}>
              <div className={`h-full rounded-[28px] border ${src.borderColor} bg-carbon-2/80 p-6 md:p-7 flex flex-col justify-between shadow-card backdrop-blur-xl hover:border-white/20 transition-all group`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${src.bgColor} flex items-center justify-center`}>
                      {src.customIcon ? src.customIcon : Icon && <Icon size={24} className={src.iconColor} />}
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-carbon-3 text-dim border border-white/5">
                      {src.tag}
                    </span>
                  </div>

                  <h3 className="text-[20px] font-bold text-blanco-calido leading-tight">
                    {src.title}
                  </h3>

                  <p className="text-[13.5px] text-muted leading-relaxed">
                    {src.description}
                  </p>
                </div>
              </div>
            </FadeInView>
          )
        })}
      </div>
    </section>
  )
}
