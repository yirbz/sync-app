"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PhoneMockupProps {
  children: React.ReactNode
  className?: string
  innerClassName?: string
}

export function PhoneMockup({ children, className, innerClassName }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[280px] sm:w-[310px] md:w-[330px] rounded-[44px] p-3 bg-gradient-to-b from-[#2d1a1e] via-[#1a0c0e] to-[#120709] border-[5px] border-[#381e22] shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(229,40,59,0.15)] ring-1 ring-white/10 overflow-hidden select-none",
        className
      )}
    >
      {/* Top Dynamic Island / Speaker Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-inner">
        <div className="w-2.5 h-2.5 rounded-full bg-[#111]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#181825] border border-white/10 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-blue-500/50" />
        </div>
      </div>

      {/* Screen Container */}
      <div
        className={cn(
          "relative w-full rounded-[34px] bg-carbon-2 overflow-hidden border border-white/5 pt-7 text-blanco-calido min-h-[460px] flex flex-col justify-between",
          innerClassName
        )}
      >
        {/* Status Bar */}
        <div className="absolute top-1.5 left-0 right-0 px-6 flex items-center justify-between text-[10px] font-semibold text-dim z-20 pointer-events-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor">
              <path d="M0 10h3V7H0v3zm4 0h3V5H4v5zm4 0h3V3H8v7zm4 0h3V0h-3v10z"/>
            </svg>
            <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8 0L0 5a14 14 0 0 1 16 0l-4-3zM8 8a4 4 0 0 0-3 1.5L8 12l3-2.5A4 4 0 0 0 8 8z"/>
            </svg>
            <div className="w-4 h-2 rounded-[2px] border border-current p-[1px] flex items-center">
              <div className="h-full w-3/4 bg-current rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Dynamic Screen Content */}
        <div className="relative z-10 flex-1 flex flex-col">{children}</div>

        {/* Home Indicator */}
        <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mb-2 shrink-0 z-20" />
      </div>
    </div>
  )
}
