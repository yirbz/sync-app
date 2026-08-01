"use client"

import { cn } from "@/lib/utils"

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-[linear-gradient(120deg,rgba(255,248,246,0.6)_0%,rgba(255,248,246,1)_40%,rgba(255,107,122,1)_50%,rgba(255,248,246,1)_60%,rgba(255,248,246,0.6)_100%)] bg-[length:200%_100%]",
        !disabled && "animate-shiny-text",
        className
      )}
      style={{ animationDuration }}
    >
      {text}
      <style jsx global>{`
        @keyframes shiny-text-sweep {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-shiny-text {
          animation: shiny-text-sweep var(--animation-duration, 5s) linear infinite;
        }
      `}</style>
    </span>
  )
}
