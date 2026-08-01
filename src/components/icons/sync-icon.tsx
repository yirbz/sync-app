"use client"

import React from "react"
import { cn } from "@/lib/utils"

type SyncIconVariant =
  | "primary"
  | "dark"
  | "light"
  | "flat"
  | "mono-b"
  | "mono-w"
  | "outline"
  | "badge"

interface SyncIconProps {
  variant?: SyncIconVariant
  size?: number
  className?: string
  showBadge?: boolean
}

const variantStyles: Record<SyncIconVariant, { bg: string; dot: string; ring: string }> = {
  primary: {
    bg: "bg-gradient-to-br from-escarlata via-escarlata-2 to-rojo-profundo",
    dot: "fill-blanco-calido",
    ring: "stroke-blanco-calido",
  },
  dark: {
    bg: "bg-gradient-to-br from-carbon-2 to-carbon border border-[#351A1D]",
    dot: "fill-coral",
    ring: "stroke-coral",
  },
  light: {
    bg: "bg-blanco-calido border border-[#F1D3D6]",
    dot: "fill-carmesi-claro",
    ring: "stroke-carmesi-claro",
  },
  flat: {
    bg: "bg-escarlata",
    dot: "fill-blanco-calido",
    ring: "hidden",
  },
  "mono-b": {
    bg: "bg-white border border-[#E6E6E6]",
    dot: "fill-[#161616]",
    ring: "stroke-[#161616]",
  },
  "mono-w": {
    bg: "bg-[#161616]",
    dot: "fill-white",
    ring: "stroke-white",
  },
  outline: {
    bg: "bg-white border-2 border-[#E6E6E6]",
    dot: "fill-none stroke-escarlata",
    ring: "stroke-escarlata",
  },
  badge: {
    bg: "bg-gradient-to-br from-escarlata to-rojo-profundo",
    dot: "fill-blanco-calido",
    ring: "stroke-blanco-calido",
  },
}

export function SyncIcon({
  variant = "primary",
  size = 48,
  className,
  showBadge,
}: SyncIconProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-[22%] shrink-0 select-none overflow-hidden",
        styles.bg,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-[60%] h-[60%]"
        fill="none"
      >
        <circle
          cx="62"
          cy="42"
          r="24"
          className={cn(styles.ring, variant === "flat" && "hidden")}
          strokeWidth={7}
          fill="none"
        />
        <circle
          cx="38"
          cy="54"
          r="21"
          className={cn(styles.dot, variant === "outline" && "stroke-escarlata")}
          fill={variant === "outline" ? "none" : undefined}
          strokeWidth={variant === "outline" ? 6 : undefined}
        />
      </svg>
      {showBadge && variant === "badge" && (
        <div className="absolute top-[9px] right-[9px] w-[11px] h-[11px] rounded-full bg-coral shadow-[0_0_0_3px_rgba(255,255,255,0.55)]" />
      )}
    </div>
  )
}