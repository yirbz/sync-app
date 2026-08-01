"use client"

import Link from "next/link"
import { FadeInView } from "@/components/landing/fade-in-view"
import { DoubleChevron } from "@/components/landing/tag-badge"

export function CtaFinal() {
  return (
    <section className="relative px-4 py-20 md:px-6 md:py-24 max-w-5xl mx-auto">
      <FadeInView>
        <div className="relative rounded-[36px] border border-white/10 bg-gradient-to-b from-[#251216] via-[#1a0c0e] to-[#120709] p-8 md:p-14 overflow-hidden shadow-elevated text-center">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-escarlata/20 rounded-full blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center">
            <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-blanco-calido">
              Comienza tu sala en segundos
            </h2>
            <p className="mt-4 text-[15px] md:text-[17px] text-muted leading-relaxed max-w-lg">
              Reúne a tus amigos hoy mismo y disfruta del mejor entretenimiento en sincronía.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <Link href="/auth" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-escarlata hover:bg-escarlata-2 text-blanco-calido text-[15px] font-bold flex items-center justify-center gap-2 shadow-fab transition-all active:scale-95"
                >
                  <span>Crear mi sala ahora</span>
                  <DoubleChevron />
                </button>
              </Link>
              <a href="#pricing" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-carbon-3 hover:bg-carbon-3/80 text-blanco-calido text-[15px] font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Ver planes</span>
                  <DoubleChevron />
                </button>
              </a>
            </div>
          </div>
        </div>
      </FadeInView>
    </section>
  )
}
