"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play, Hash, Users, Tv } from "lucide-react"
import { SyncIcon } from "@/components/icons/sync-icon"
import { RetroGrid } from "@/components/magicui/retro-grid"
import { Particles } from "@/components/magicui/particles"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { ShinyText } from "@/components/reactbits/shiny-text"
import { SplitText } from "@/components/reactbits/split-text"
import { RotatingText } from "@/components/reactbits/rotating-text"

export function Hero() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    router.push(`/rooms?code=${code}`)
  }

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-16 md:px-6 md:pt-40 md:pb-24 min-h-[90vh]">
      {/* Magic UI Retro Grid & Embers */}
      <RetroGrid angle={60} />
      <Particles quantity={40} color="#FF6B7A" className="opacity-70" />

      {/* Warm Ambient Backlight Glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-12 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-escarlata/15 blur-[140px]" />
        <div className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-coral/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* React Bits Shiny Text Eyebrow */}
        <BlurFade delay={0.1}>
          <div className="relative mb-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-carbon-2/90 border border-white/10 text-[13px] font-medium text-blanco-calido/90 backdrop-blur-md shadow-card overflow-hidden">
            <BorderBeam size={100} duration={6} colorFrom="#E5283B" colorTo="#FF6B7A" />
            <SyncIcon size={22} variant="badge" showBadge />
            <ShinyText text="Noche de películas y videos en grupo" speed={4} />
          </div>
        </BlurFade>

        {/* React Bits SplitText & RotatingText Headline */}
        <BlurFade delay={0.2}>
          <h1 className="text-[clamp(2.4rem,6vw,4.2rem)] font-black leading-[1.08] tracking-[-0.03em] text-blanco-calido max-w-2xl">
            <SplitText text="Tu sala de cine privada," />{" "}
            <RotatingText words={["estés donde estés", "con tus amigos", "en sincronía 4K", "sin publicidad"]} />
          </h1>
        </BlurFade>

        {/* Human Subtitle */}
        <BlurFade delay={0.3}>
          <p className="mt-5 max-w-xl text-[16px] md:text-[17px] leading-relaxed text-muted font-normal">
            Sin suscripciones corporativas, sin publicidad y sin registros complicados. Pon una película de tu Jellyfin o un video de YouTube y míralo con tus amigos en sincronía exacta.
          </p>
        </BlurFade>

        {/* Quick Join Card with Magic UI Border Beam */}
        <BlurFade delay={0.4}>
          <div className="relative mt-9 w-full max-w-md rounded-[28px] border border-white/10 bg-carbon-2/90 p-4 sm:p-5 shadow-elevated backdrop-blur-xl overflow-hidden">
            <BorderBeam size={200} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />

            <form onSubmit={handleQuickJoin} className="space-y-3 relative z-10">
              <div className="relative">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-x-0 -translate-y-1/2 text-dim" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Ingresa código de sala (ej. CINE-88)"
                  className="w-full rounded-[18px] bg-carbon-3 pl-11 pr-4 py-3.5 text-[14px] font-mono font-semibold tracking-wider text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <ShimmerButton
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full py-3 px-4 rounded-[16px] text-[14px] font-bold flex items-center justify-center gap-2"
                >
                  <Play size={16} className="fill-white" />
                  <span>Entrar a ver</span>
                </ShimmerButton>

                <Link href="/auth" className="w-full">
                  <button
                    type="button"
                    className="w-full py-3 px-4 rounded-[16px] bg-carbon-3 hover:bg-carbon-3/80 text-blanco-calido text-[14px] font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Tv size={16} className="text-coral" />
                    <span>Crear sala</span>
                  </button>
                </Link>
              </div>
            </form>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-[12px] text-dim relative z-10">
              <Users size={13} className="text-emerald-400" />
              <span>Conecta con tus amigos desde cualquier navegador</span>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
