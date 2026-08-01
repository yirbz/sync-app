"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface SyncLoaderProps {
  size?: number
  className?: string
  text?: string
}

export function SyncLoader({ size = 72, className, text }: SyncLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3.5 select-none", className)}>
      {/* SVG Icon directly without background box */}
      <svg
        viewBox="0 0 100 100"
        className="overflow-visible"
        style={{ width: size, height: size }}
        fill="none"
      >
        {/* Ring Circle - Snappy swap animation */}
        <circle
          cx="62"
          cy="42"
          r="24"
          fill="none"
          stroke="#E5283B"
          strokeWidth="7.5"
          className="animate-sync-snappy-1"
        />

        {/* Dot Circle - Snappy swap animation */}
        <circle
          cx="38"
          cy="54"
          r="21"
          fill="#FFF8F6"
          className="animate-sync-snappy-2"
        />
      </svg>

      {text && (
        <p className="text-[13.5px] font-semibold tracking-wide text-blanco-calido/90 animate-pulse">
          {text}
        </p>
      )}

      {/* Snappy fast circle swap CSS animation */}
      <style jsx global>{`
        @keyframes sync-snappy-1 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-24px, 12px) scale(0.9);
          }
        }
        @keyframes sync-snappy-2 {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(24px, -12px) scale(1.1);
          }
        }
        .animate-sync-snappy-1 {
          animation: sync-snappy-1 0.75s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: 62px 42px;
        }
        .animate-sync-snappy-2 {
          animation: sync-snappy-2 0.75s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: 38px 54px;
        }
      `}</style>
    </div>
  )
}
