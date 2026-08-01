"use client"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  className?: string
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
  borderWidth?: number
}

export function BorderBeam({
  className,
  size = 250,
  duration = 8,
  delay = 0,
  colorFrom = "#E5283B",
  colorTo = "#FF6B7A",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": 90,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        // Mask
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        // Pseudo beam
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[background:radial-gradient(circle_at_center,var(--color-from)_0%,var(--color-to)_50%,transparent_100%)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
    >
      <style jsx global>{`
        @keyframes border-beam {
          100% {
            offset-distance: 100%;
          }
        }
        .after\\:animate-border-beam::after {
          animation: border-beam calc(var(--duration) * 1s) infinite linear;
          animation-delay: var(--delay);
        }
      `}</style>
    </div>
  )
}
