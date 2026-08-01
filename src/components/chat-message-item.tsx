"use client"

import { useState, useRef } from "react"
import { Reply } from "lucide-react"
import type { ChatMessage } from "@/lib/room"

interface ChatMessageItemProps {
  message: ChatMessage
  isSelf: boolean
  onReply: (message: ChatMessage) => void
  formatTime: (iso: string) => string
}

export function ChatMessageItem({ message, isSelf, onReply, formatTime }: ChatMessageItemProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const vibratedRef = useRef(false)

  const SWIPE_THRESHOLD = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    vibratedRef.current = false
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // If vertical scroll is dominating, cancel horizontal swipe
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 10) return

    // Only allow swipe to the right
    if (deltaX > 0) {
      const dampened = Math.min(deltaX * 0.45, 90)
      setTranslateX(dampened)

      if (dampened >= SWIPE_THRESHOLD && !vibratedRef.current) {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          try { navigator.vibrate(15) } catch {}
        }
        vibratedRef.current = true
      }
    }
  }

  const handleTouchEnd = () => {
    if (translateX >= SWIPE_THRESHOLD) {
      onReply(message)
    }
    setTranslateX(0)
    setIsSwiping(false)
    touchStartRef.current = null
  }

  return (
    <div
      className="relative select-none touch-pan-y my-1 overflow-hidden max-w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Swipe reveal background indicator */}
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-escarlata/20 text-escarlata transition-opacity duration-150"
        style={{
          opacity: Math.min(translateX / SWIPE_THRESHOLD, 1),
          transform: `translateY(-50%) scale(${Math.min(translateX / SWIPE_THRESHOLD, 1)})`,
        }}
      >
        <Reply size={16} />
      </div>

      {/* Message content container with swipe transform */}
      <div
        className={`flex ${isSelf ? "justify-end" : "justify-start"} transition-transform ease-out`}
        style={{
          transform: `translateX(${translateX}px)`,
          transitionDuration: isSwiping ? "0ms" : "200ms",
        }}
      >
        <div
          className={`max-w-[85%] rounded-[18px] px-3.5 py-2.5 shadow-sm border ${
            isSelf
              ? "bg-escarlata/15 border-escarlata/20 rounded-br-[4px]"
              : "bg-carbon-3 border-white/5 rounded-bl-[4px]"
          }`}
        >
          {/* Header with name and timestamp */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-semibold ${isSelf ? "text-escarlata" : "text-muted"}`}>
              {isSelf ? "Tú" : message.userName}
            </span>
            <span className="text-[10px] text-dim">{formatTime(message.createdAt)}</span>
          </div>

          {/* Quoted reply box if this message is a reply */}
          {message.replyToUserName && (
            <div className="mb-2 p-2 rounded-[10px] bg-black/25 border-l-2 border-escarlata text-[12px]">
              <p className="font-semibold text-escarlata text-[11px] truncate">
                {message.replyToUserName}
              </p>
              <p className="text-dim truncate">{message.replyToContent}</p>
            </div>
          )}

          {/* Message body */}
          <p className="text-[14px] text-blanco-calido leading-relaxed break-words [overflow-wrap:anywhere]">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
