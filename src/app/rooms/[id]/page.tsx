"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { getRoomById, leaveRoom, getInviteLink } from "@/lib/room"
import { getStreamUrl, getImageUrl, syncPlayPause, syncPlayUnpause, syncPlaySeek, syncPlayBuffering, syncPlayPing, syncPlayNext, syncPlayPrevious, syncPlayStop, setSyncPlayQueue } from "@/lib/syncplay"
import { useAuth } from "@/hooks/use-auth"
import type { Room } from "@/lib/room"
import {
  Play, Pause, SkipBack, SkipForward, Volume2, Maximize,
  MessageCircle, Users, Copy, Check, Share2, ArrowLeft,
  LogOut, Loader2
} from "lucide-react"

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { session } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [copied, setCopied] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(100)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [loading, setLoading] = useState(true)
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const roomId = params?.id as string

  useEffect(() => {
    if (!roomId) return
    async function loadRoom() {
      const found = await getRoomById(roomId)
      if (found) {
        setRoom(found)
        if (found.itemIds.length > 0) {
          setDuration(100)
        }
      }
      setLoading(false)
    }
    loadRoom()

    return () => {
      if (pingRef.current) clearInterval(pingRef.current)
    }
  }, [roomId])

  const startPing = () => {
    if (pingRef.current) clearInterval(pingRef.current)
    pingRef.current = setInterval(() => {
      syncPlayPing().catch(() => {})
    }, 5000)
  }

  const handlePlayPause = async () => {
    if (!room) return
    try {
      if (playing) {
        await syncPlayPause()
      } else {
        await syncPlayUnpause()
      }
      setPlaying(!playing)
    } catch {}
  }

  const handleSeek = async (ticks: number) => {
    if (!room) return
    try {
      await syncPlaySeek(ticks)
      setPosition(ticks)
    } catch {}
  }

  const handleNext = async () => {
    if (!room) return
    await syncPlayNext()
  }

  const handlePrevious = async () => {
    if (!room) return
    await syncPlayPrevious()
  }

  const handleLeave = async () => {
    if (!room) return
    if (pingRef.current) clearInterval(pingRef.current)
    await leaveRoom(room.id)
    router.push("/rooms")
  }

  const copyLink = () => {
    if (!room) return
    navigator.clipboard.writeText(getInviteLink(room))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    setMessages((prev) => [...prev, { user: session?.userName || "Tú", text: chatInput.trim() }])
    setChatInput("")
  }

  const ticksToTime = (ticks: number) => {
    const seconds = Math.floor(ticks / 10000000)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-dim" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-4 text-center">
        <p className="text-[15px] text-muted mb-4">Sala no encontrada</p>
        <Button onClick={() => router.push("/rooms")}>Volver a salas</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Video area (placeholder) */}
      <div className="relative w-full aspect-video bg-carbon-3 flex items-center justify-center">
        <button
          onClick={handlePlayPause}
          className="w-16 h-16 rounded-full bg-escarlata shadow-fab flex items-center justify-center hover:bg-escarlata-2 transition-colors"
        >
          {playing ? <Pause size={28} className="text-blanco-calido" /> : <Play size={28} className="text-blanco-calido ml-1" />}
        </button>

        {/* Top overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3">
          <button onClick={() => router.push("/rooms")} className="w-9 h-9 rounded-full bg-carbon/60 flex items-center justify-center text-blanco-calido">
            <ArrowLeft size={18} />
          </button>
          <Badge variant="coral">● En vivo</Badge>
        </div>

        {/* Bottom overlay with progress */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-blanco-calido/70">{ticksToTime(position)}</span>
            <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-escarlata rounded-full transition-all" style={{ width: `${(position / Math.max(duration, 1)) * 100}%` }} />
            </div>
            <span className="text-[11px] text-blanco-calido/70">{ticksToTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Room info */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-[650] leading-[1.2] text-blanco-calido">{room.name}</h1>
            <p className="text-[13px] text-muted">{room.participantCount} viendo · Creada por {room.createdBy}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="w-10 h-10 rounded-full bg-carbon-3 flex items-center justify-center hover:bg-carbon-2 transition-colors" title="Invitar">
              {copied ? <Check size={16} className="text-escarlata" /> : <Share2 size={16} className="text-dim" />}
            </button>
            <button onClick={() => setShowChat(!showChat)} className="w-10 h-10 rounded-full bg-carbon-3 flex items-center justify-center hover:bg-carbon-2 transition-colors" title="Chat">
              <MessageCircle size={16} className="text-dim" />
            </button>
          </div>
        </div>
      </div>

      {/* Playback controls */}
      <div className="px-4 py-3">
        <Card className="flex items-center justify-center gap-6 py-4">
          <button onClick={handlePrevious} className="text-dim hover:text-blanco-calido transition-colors">
            <SkipBack size={20} />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full bg-escarlata flex items-center justify-center hover:bg-escarlata-2 transition-colors shadow-glow"
          >
            {playing ? <Pause size={20} className="text-blanco-calido" /> : <Play size={20} className="text-blanco-calido ml-0.5" />}
          </button>
          <button onClick={handleNext} className="text-dim hover:text-blanco-calido transition-colors">
            <SkipForward size={20} />
          </button>
        </Card>
      </div>

      {/* Participants */}
      <div className="px-4 mb-4">
        <h3 className="text-[13px] font-semibold text-muted mb-2">Participantes</h3>
        <div className="flex items-center gap-3">
          <Avatar name={session?.userName || "Tú"} size={40} active />
          <div className="flex -space-x-2">
            {Array.from({ length: Math.max(0, room.participantCount - 1) }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-carbon-3 border-2 border-carbon flex items-center justify-center text-[11px] font-medium text-dim">
                U
              </div>
            ))}
          </div>
          <span className="text-[12px] text-dim">+{room.participantCount} en la sala</span>
        </div>
      </div>

      {/* Chat panel */}
      {showChat && (
        <div className="fixed inset-0 z-40 bg-carbon/80 flex flex-col" onClick={() => setShowChat(false)}>
          <div className="mt-auto bg-carbon-2 rounded-t-[20px] max-h-[60vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-[17px] font-semibold text-blanco-calido">Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-dim">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
              {messages.map((msg, i) => (
                <div key={i} className="mb-3">
                  <span className="text-[12px] font-medium text-escarlata">{msg.user}</span>
                  <p className="text-[14px] text-blanco-calido">{msg.text}</p>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-[13px] text-dim text-center py-8">Sin mensajes aún</p>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-white/5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Escribe un mensaje..."
                className="flex-1 rounded-[14px] bg-carbon-3 px-4 py-2.5 text-[14px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
              />
              <Button variant="icon" size="icon" onClick={sendChat} disabled={!chatInput.trim()}>
                <Play size={14} className="ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leave button */}
      <div className="px-4 pb-6 mt-auto">
        <Button variant="ghost" className="w-full text-dim hover:text-coral" onClick={handleLeave}>
          <LogOut size={16} className="mr-2" />
          Abandonar sala
        </Button>
      </div>
    </div>
  )
}

function X({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}