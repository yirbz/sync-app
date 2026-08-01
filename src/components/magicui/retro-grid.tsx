"use client"

import { cn } from "@/lib/utils"

export function RetroGrid({
  className,
  angle = 65,
}: {
  className?: string
  angle?: number
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-35 select-none [perspective:200px]",
        className
      )}
      style={{ "--grid-angle": `${angle}deg` } as React.CSSProperties}
    >
      {/* Grid Canvas Grid Lines */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "animate-grid",
            "[background-repeat:repeat] [background-size:60px_60px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:200%]",
            "[background-image:linear-gradient(to_right,rgba(229,40,59,0.25)_1px,transparent_0),linear-gradient(to_bottom,rgba(229,40,59,0.25)_1px,transparent_0)]"
          )}
        />
      </div>

      {/* Ambient Radial Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-carbon/80 pointer-events-none" />

      <style jsx global>{`
        @keyframes grid-loop {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        .animate-grid {
          animation: grid-loop 15s linear infinite;
        }
      `}</style>
    </div>
  )
}
