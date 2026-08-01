"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TagBadgeProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "escarlata" | "coral"
}

export function DoubleChevron({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block ml-1 shrink-0", className)}
    >
      <polyline points="7 17 12 12 7 7" />
      <polyline points="13 17 18 12 13 7" />
    </svg>
  )
}

export function TagBadge({ children, className, variant = "default" }: TagBadgeProps) {
  const variantStyles = {
    default: "bg-carbon-3/90 text-blanco-calido/90 border-white/10 hover:border-white/20",
    escarlata: "bg-escarlata/15 text-escarlata border-escarlata/30 hover:border-escarlata/50",
    coral: "bg-coral/15 text-coral border-coral/30 hover:border-coral/50",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium tracking-tight border backdrop-blur-md transition-colors",
        variantStyles[variant],
        className
      )}
    >
      <span>{children}</span>
      <DoubleChevron />
    </span>
  )
}
