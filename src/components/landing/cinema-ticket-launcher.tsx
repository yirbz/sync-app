"use client"

import { useState } from "react"
import { BlurFade } from "@/components/magicui/blur-fade"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Ripple } from "@/components/magicui/ripple"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import { Copy, Check, ArrowRight, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { SyncIcon } from "@/components/icons/sync-icon"

export function CinemaTicketLauncher() {
  const router = useRouter()
  const [userName, setUserName] = useState("Miembro Vip")
  const [roomCode, setRoomCode] = useState("CINE-882")
  const [copied, setCopied] = useState(false)

  const generateNewCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900)
    setRoomCode(`CINE-${randomNum}`)
  }

  const copyInvite = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLaunch = () => {
    router.push(`/rooms?code=${roomCode}`)
  }

  return (
    <section className="relative px-4 py-16 md:px-6 md:py-24 max-w-5xl mx-auto select-none overflow-hidden">
      <BlurFade delay={0.1}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[12px] font-bold uppercase tracking-wider mb-3">
            <span>Paso Final · Acción Instantánea</span>
          </div>
          <h2 className="text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-blanco-calido tracking-tight">
            Genera tu Pase de Entrada a la Sala
          </h2>
          <p className="mt-2 text-[15px] text-muted max-w-lg mx-auto">
            Personaliza el pase de cine de tu grupo y entra de inmediato a transmitir con tus amigos.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div className="relative max-w-2xl mx-auto rounded-[32px] border border-white/10 bg-carbon-2 p-6 sm:p-8 shadow-elevated space-y-6 overflow-hidden">
          <BorderBeam size={240} duration={8} colorFrom="#E5283B" colorTo="#FF6B7A" />

          {/* Virtual Cinema Ticket with Magic UI Ripple backdrop */}
          <div className="relative rounded-[24px] bg-gradient-to-r from-carbon-3 via-[#251317] to-carbon-3 border border-escarlata/40 p-6 shadow-glow overflow-hidden">
            <Ripple mainCircleSize={140} numCircles={4} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <SyncIcon size={42} variant="primary" />
                <div>
                  <span className="text-[11px] font-mono text-coral font-bold uppercase tracking-wider block">
                    Pase de Cine Privado
                  </span>
                  <h3 className="text-[18px] font-extrabold text-blanco-calido">
                    Sala Sync #1
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={generateNewCode}
                className="px-3 py-1.5 rounded-full bg-carbon-2 hover:bg-carbon-3 border border-white/10 text-[12px] font-mono text-blanco-calido flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} className="text-coral" />
                <span>Generar otro código</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-white/10 relative z-10">
              <div>
                <span className="text-[11px] text-dim block mb-1">Nombre / Apodo:</span>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-carbon-2 border border-white/10 rounded-xl px-3 py-1.5 text-[13.5px] font-bold text-blanco-calido outline-none focus:border-escarlata"
                />
              </div>

              <div>
                <span className="text-[11px] text-dim block mb-1">Código de Sala:</span>
                <span className="text-[16px] font-mono font-extrabold text-escarlata block pt-1">
                  <DecryptedText key={roomCode} text={roomCode} speed={30} maxIterations={8} />
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <button
                type="button"
                onClick={copyInvite}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-carbon-2 hover:bg-carbon-3 text-blanco-calido text-[13px] font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                <span>{copied ? "¡Enlace copiado!" : "Copiar Enlace de Invitación"}</span>
              </button>

              <ShimmerButton
                type="button"
                onClick={handleLaunch}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2"
              >
                <span>Entrar a la Sala</span>
                <ArrowRight size={16} />
              </ShimmerButton>
            </div>
          </div>
        </div>
      </BlurFade>
    </section>
  )
}
