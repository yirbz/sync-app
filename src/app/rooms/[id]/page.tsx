"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { detectMediaFromUrl } from "@/lib/media-detector"
import { Button } from "@/components/ui/button"
import { YouTubeBrowserModal } from "@/components/youtube-browser-modal"
import { WebBrowserModal } from "@/components/web-browser-modal"
import { GoogleDriveModal } from "@/components/google-drive-modal"
import { ChatMessageItem } from "@/components/chat-message-item"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  getRoomById, getRoomMessages, sendRoomMessage, getInviteLink,
  addToQueue, removeFromQueue, updatePlayback, getQueue, transferControl,
  type Room, type ChatMessage, type QueueItem, type PlaybackState
} from "@/lib/room"
import { apiUpdatePlayback } from "@/lib/api"
import { getLibraries, getItems, type LibraryFolder, type LibraryItem } from "@/lib/library"
import { extractDriveFileId, getDriveDirectStreamUrl, getDrivePreviewIframeUrl } from "@/lib/drive"
import { useAuth } from "@/hooks/use-auth"
import {
  Play, Pause, MessageCircle, Users, Copy, Check, Share2, ArrowLeft,
  LogOut, Loader2, Send, Film, Music, X, Hash, Search, SkipForward,
  Plus, Trash2, ListMusic, Reply, Globe, HardDrive
} from "lucide-react"

type Tab = "chat" | "queue" | "content" | "info"

const JELLYFIN_URL = "https://sync-app.duckdns.org"
const POSITION_TOLERANCE = 2

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const processedParamRef = useRef(false)
  const { session } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<Tab>("chat")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string; content: string } | null>(null)
  const [unreadChatCount, setUnreadChatCount] = useState(0)
  const [toastMessage, setToastMessage] = useState<{ id: string; userName: string; content: string } | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [libraries, setLibraries] = useState<LibraryFolder[]>([])
  const [selectedLib, setSelectedLib] = useState<string>("")
  const [libItems, setLibItems] = useState<LibraryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [platform, setPlatform] = useState<"jellyfin" | "youtube" | "drive">("jellyfin")

  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [playbackState, setPlaybackState] = useState<PlaybackState>({ position: 0, isPlaying: false })
  const [settingContent, setSettingContent] = useState(false)

  const [showYouTubeBrowser, setShowYouTubeBrowser] = useState(false)
  const [showWebBrowserModal, setShowWebBrowserModal] = useState(false)
  const [showDriveModal, setShowDriveModal] = useState(false)
  const [driveInput, setDriveInput] = useState("")
  const [driveTitleInput, setDriveTitleInput] = useState("")
  const [driveExtracting, setDriveExtracting] = useState(false)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [driveIframeMode, setDriveIframeMode] = useState(false)
  const [ytApiReady, setYtApiReady] = useState(false)

  const ytPlayerRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastActionUpdateRef = useRef<string>("")
  const applyingRemoteRef = useRef(false)
  const tabRef = useRef<Tab>(tab)
  tabRef.current = tab

  const roomId = params?.id as string

  const currentItem = currentIndex >= 0 && queue[currentIndex] ? queue[currentIndex] : null

  const currentItemRef = useRef(currentItem)
  currentItemRef.current = currentItem

  const playbackStateRef = useRef(playbackState)
  playbackStateRef.current = playbackState

  const isController = room ? (room.controllerUserId ? room.controllerUserId === session?.userId : true) : false
  const isControllerRef = useRef(isController)
  isControllerRef.current = isController

  const jellyfinStreamUrl = currentItem?.platform === "jellyfin" && currentItem?.contentId
    ? `${JELLYFIN_URL}/Videos/${currentItem.contentId}/stream?static=true&api_key=${session?.token}`
    : null

  function getCurrentPosition(): number {
    const item = currentItemRef.current
    if (item?.platform === "youtube" && ytPlayerRef.current?.getCurrentTime) {
      try { return ytPlayerRef.current.getCurrentTime() || 0 } catch { return playbackStateRef.current.position }
    }
    if ((item?.platform === "jellyfin" || item?.platform === "web" || item?.platform === "drive") && videoRef.current) {
      return videoRef.current.currentTime || 0
    }
    return playbackStateRef.current.position || 0
  }

  function destroyYtPlayer() {
    try {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        ytPlayerRef.current.destroy()
      }
    } catch {}
    ytPlayerRef.current = null
  }

  function initYtPlayer(videoId: string, startPosition: number, autoPlay: boolean) {
    const el = document.getElementById("youtube-player")
    if (!el || !(window as any).YT?.Player) return

    try {
      ytPlayerRef.current = new (window as any).YT.Player("youtube-player", {
        videoId,
        playerVars: { controls: 1, rel: 0 },
        events: {
          onReady: (e: any) => {
            e.target.seekTo(startPosition, true)
            if (autoPlay) e.target.playVideo()
          },
          onStateChange: (e: any) => {
            if (applyingRemoteRef.current) return
            if (!isControllerRef.current) return
            const YT = (window as any).YT
            if (e.data === YT.PlayerState.PLAYING) {
              setPlaybackState(prev => ({ ...prev, isPlaying: true }))
              const pos = getCurrentPosition()
              apiUpdatePlayback(roomId, { isPlaying: true, position: pos }).then(r => {
                if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
              }).catch(() => {})
            } else if (e.data === YT.PlayerState.PAUSED) {
              setPlaybackState(prev => ({ ...prev, isPlaying: false }))
              const pos = getCurrentPosition()
              apiUpdatePlayback(roomId, { isPlaying: false, position: pos }).then(r => {
                if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
              }).catch(() => {})
            }
          },
        },
      })
    } catch (err) {
      console.error("YT player init error:", err)
    }
  }

  // Load YT IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return
    if ((window as any).YT) { setYtApiReady(true); return }
    (window as any).onYouTubeIframeAPIReady = () => setYtApiReady(true)
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
  }, [])

  // YT player lifecycle
  useEffect(() => {
    if (!currentItem || currentItem.platform !== "youtube") {
      destroyYtPlayer()
      return
    }

    if (!ytApiReady) return

    applyingRemoteRef.current = true
    const pos = playbackState.position
    const willPlay = playbackState.isPlaying

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
      ytPlayerRef.current.loadVideoById(currentItem.contentId, pos)
      if (!willPlay) ytPlayerRef.current.pauseVideo()
    } else {
      initYtPlayer(currentItem.contentId, pos, willPlay)
    }

    const timer = setTimeout(() => { applyingRemoteRef.current = false }, 500)
    return () => { clearTimeout(timer); destroyYtPlayer() }
  }, [currentItem?.contentId, ytApiReady])

  const loadRoom = useCallback(async () => {
    if (!roomId) return
    const found = await getRoomById(roomId)
    if (found) setRoom(found)
    setLoading(false)
  }, [roomId])

  const loadQueue = useCallback(async () => {
    if (!roomId) return
    try {
      const data = await getQueue(roomId)
      setQueue(data.queue)
      setCurrentIndex(data.currentIndex)
      setPlaybackState(data.playbackState)
      if (data.currentItem) {
        setRoom(prev => prev ? { ...prev, currentItem: data.currentItem } : prev)
      }
    } catch {}
  }, [roomId])

  const loadMessages = useCallback(async () => {
    if (!roomId) return
    const msgs = await getRoomMessages(roomId)
    setMessages(msgs)
  }, [roomId])

  useEffect(() => { loadRoom() }, [loadRoom])
  useEffect(() => { loadMessages() }, [loadMessages])
  useEffect(() => { loadQueue() }, [loadQueue])

  // Handle initial ?url= or ?mediaId= passed from Home or Library
  useEffect(() => {
    if (!room || !searchParams || processedParamRef.current) return
    const urlParam = searchParams.get("url")
    const mediaIdParam = searchParams.get("mediaId")

    if (urlParam) {
      processedParamRef.current = true
      const detected = detectMediaFromUrl(urlParam)
      const item = detected || { platform: "web", contentId: urlParam, title: "Video Web" }
      handleAddToQueue(item)
      router.replace(`/rooms/${room.id}`, { scroll: false })
    } else if (mediaIdParam) {
      processedParamRef.current = true
      handleAddToQueue({ platform: "jellyfin", contentId: mediaIdParam, title: "Media Jellyfin" })
      router.replace(`/rooms/${room.id}`, { scroll: false })
    }
  }, [room?.id, searchParams])

  // Real-time WebSocket sync
  useEffect(() => {
    if (!roomId || !session?.token) return

    let socket: WebSocket | null = null
    let reconnectTimer: any = null

    const connect = () => {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
      const wsUrl = apiBase.replace(/^http/, "ws").replace(/\/api$/, "/ws")
      socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        if (session?.token) {
          socket?.send(JSON.stringify({ type: "auth", token: session.token, roomId }))
        }
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "chat_message") {
            const newMsg = data.message as ChatMessage
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            if (tabRef.current !== "chat") {
              setUnreadChatCount((prev) => prev + 1)
              setToastMessage({
                id: newMsg.id,
                userName: newMsg.userName,
                content: newMsg.content,
              })
            }
          } else if (data.type === "playback_update") {
            applyingRemoteRef.current = true

            if (data.queue) setQueue(data.queue)
            if (typeof data.currentIndex === "number") setCurrentIndex(data.currentIndex)
            if (data.currentItem) setRoom((prev) => (prev ? { ...prev, currentItem: data.currentItem } : prev))

            const isPlaying = data.isPlaying !== undefined ? data.isPlaying : (data.playbackState?.isPlaying ?? false)
            const position = typeof data.position === "number" ? data.position : (data.playbackState?.position ?? 0)

            setPlaybackState((prev) => ({
              position: typeof position === "number" ? position : prev.position,
              isPlaying: isPlaying !== undefined ? isPlaying : prev.isPlaying,
              lastUpdated: data.lastUpdated || data.playbackState?.lastUpdated,
            }))

            const item = currentItemRef.current
            if (item?.platform === "youtube" && ytPlayerRef.current?.getPlayerState) {
              try {
                if (isPlaying) ytPlayerRef.current.playVideo()
                else ytPlayerRef.current.pauseVideo()
                if (typeof position === "number") {
                  const cur = ytPlayerRef.current.getCurrentTime() || 0
                  if (Math.abs(cur - position) > POSITION_TOLERANCE) {
                    ytPlayerRef.current.seekTo(position, true)
                  }
                }
              } catch {}
            } else if ((item?.platform === "jellyfin" || item?.platform === "web" || item?.platform === "drive") && videoRef.current) {
              try {
                if (isPlaying && videoRef.current.paused) videoRef.current.play()
                else if (!isPlaying && !videoRef.current.paused) videoRef.current.pause()
                if (typeof position === "number" && Math.abs(videoRef.current.currentTime - position) > POSITION_TOLERANCE) {
                  videoRef.current.currentTime = position
                }
              } catch {}
            }

            setTimeout(() => { applyingRemoteRef.current = false }, 1000)
          } else if (data.type === "queue_change") {
            if (data.queue) setQueue(data.queue)
            if (typeof data.currentIndex === "number") setCurrentIndex(data.currentIndex)
            if (data.playbackState) setPlaybackState(data.playbackState)
          }
        } catch {}
      }

      socket.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [roomId, session?.token])

  useEffect(() => {
    if (tab === "chat") {
      setUnreadChatCount(0)
      setToastMessage(null)
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [tab, messages])

  useEffect(() => {
    if (tab === "content" && libraries.length === 0) {
      getLibraries().then(setLibraries)
    }
  }, [tab, libraries.length])

  useEffect(() => {
    if (!selectedLib) { setLibItems([]); return }
    getItems(selectedLib, { limit: 30, searchTerm: searchTerm || undefined }).then((r) => setLibItems(r.items))
  }, [selectedLib, searchTerm])

  const handleSend = async () => {
    if (!chatInput.trim() || !roomId || sending) return
    setSending(true)
    const content = chatInput.trim()
    const reply = replyingTo || undefined
    setChatInput("")
    setReplyingTo(null)
    try {
      await sendRoomMessage(roomId, content, reply)
    } finally {
      setSending(false)
    }
  }

  const handleLeave = async () => {
    router.push("/rooms")
  }

  const copyLink = async () => {
    if (!room) return
    const inviteUrl = getInviteLink(room)
    const shareData = {
      title: `Únete a mi sala en Sync: ${room.name}`,
      text: `¡Te invito a ver películas y videos conmigo en Sync! Código de sala: ${room.inviteCode}`,
      url: inviteUrl,
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleAddToQueue = async (item: { platform: string; contentId: string; title: string; duration?: number; imageUrl?: string }) => {
    if (!room || settingContent) return
    setSettingContent(true)
    try {
      await addToQueue(room.id, item)
      await loadQueue()
    } finally {
      setSettingContent(false)
    }
  }

  const handleRemoveFromQueue = async (itemId: string) => {
    if (!room) return
    await removeFromQueue(room.id, itemId)
    await loadQueue()
  }

  const handlePlayPause = async () => {
    if (!room) return
    const newPlaying = !playbackState.isPlaying
    setPlaybackState(prev => ({ ...prev, isPlaying: newPlaying }))

    applyingRemoteRef.current = true

    if (currentItem?.platform === "youtube" && ytPlayerRef.current) {
      try {
        if (newPlaying) ytPlayerRef.current.playVideo()
        else ytPlayerRef.current.pauseVideo()
      } catch {}
    } else if ((currentItem?.platform === "jellyfin" || currentItem?.platform === "web" || currentItem?.platform === "drive") && videoRef.current) {
      try {
        if (newPlaying) videoRef.current.play()
        else videoRef.current.pause()
      } catch {}
    }

    setTimeout(() => { applyingRemoteRef.current = false }, 500)

    const pos = getCurrentPosition()
    try {
      const result = await apiUpdatePlayback(room.id, { isPlaying: newPlaying, position: pos })
      if (result?.playbackState?.lastUpdated) {
        lastActionUpdateRef.current = result.playbackState.lastUpdated
      }
    } catch {}
  }

  const handleSkip = async () => {
    if (!room || currentIndex < 0 || currentIndex >= queue.length - 1) return
    const nextIndex = currentIndex + 1
    try {
      const result = await apiUpdatePlayback(room.id, { currentIndex: nextIndex, position: 0, isPlaying: true })
      if (result?.playbackState?.lastUpdated) {
        lastActionUpdateRef.current = result.playbackState.lastUpdated
      }
      await loadQueue()
    } catch {}
  }

  const handleAddJellyfin = async (item: LibraryItem) => {
    const imageUrl = item.type === "Movie" || item.type === "Series"
      ? `${JELLYFIN_URL}/Items/${item.id}/Images/Primary?api_key=${session?.token}&maxWidth=120`
      : undefined
    await handleAddToQueue({
      platform: "jellyfin",
      contentId: item.id,
      title: item.name,
      imageUrl,
    })
  }

  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({})

  // Track dynamic visualViewport height for soft keyboards & lock page scroll
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleViewportChange = () => {
      const vv = window.visualViewport
      if (!vv) return

      setViewportStyle({
        height: `${vv.height}px`,
        transform: `translateY(${vv.offsetTop}px)`,
      })

      if (window.scrollY !== 0) window.scrollTo(0, 0)
      if (document.body.scrollTop !== 0) document.body.scrollTop = 0
    }

    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener("resize", handleViewportChange)
      vv.addEventListener("scroll", handleViewportChange)
    }
    window.addEventListener("resize", handleViewportChange)
    window.addEventListener("scroll", handleViewportChange)

    handleViewportChange()

    return () => {
      if (vv) {
        vv.removeEventListener("resize", handleViewportChange)
        vv.removeEventListener("scroll", handleViewportChange)
      }
      window.removeEventListener("resize", handleViewportChange)
      window.removeEventListener("scroll", handleViewportChange)
    }
  }, [])

  const handleMessageAreaClick = () => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setIsInputFocused(false)
  }

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.scrollIntoView = () => {}
    setIsInputFocused(true)
    scrollToBottom()
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
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
    <div
      style={viewportStyle}
      className="fixed inset-0 flex flex-col bg-carbon overflow-hidden pt-[env(safe-area-inset-top,0px)]"
    >
      {/* Toast notification for incoming chat messages when in another tab */}
      {toastMessage && tab !== "chat" && (
        <div className="fixed top-14 left-4 right-4 z-[60] bg-carbon-3 border border-escarlata/40 rounded-[14px] p-3 shadow-fab flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-escarlata/20 flex items-center justify-center shrink-0">
              <MessageCircle size={16} className="text-escarlata" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-blanco-calido truncate">{toastMessage.userName}</p>
              <p className="text-[12px] text-dim truncate">{toastMessage.content}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setTab("chat")
              setUnreadChatCount(0)
              setToastMessage(null)
            }}
            className="shrink-0 px-3 py-1 rounded-[8px] bg-escarlata text-blanco-calido text-[11px] font-semibold hover:bg-escarlata-2 transition-colors ml-2"
          >
            Ver
          </button>
        </div>
      )}

      {/* Player area */}
      <div className="relative w-full aspect-video bg-carbon-3 flex items-center justify-center overflow-hidden shrink-0">
        {currentItem ? (
          <>
            {currentItem.platform === "youtube" ? (
              <div id="youtube-player" className="w-full h-full" />
            ) : currentItem.platform === "drive" ? (
              driveIframeMode ? (
                <iframe
                  src={getDrivePreviewIframeUrl(currentItem.contentId)}
                  className="w-full h-full border-0 bg-black"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  key={currentItem.contentId}
                  src={getDriveDirectStreamUrl(currentItem.contentId)}
                  className="w-full h-full object-contain bg-black"
                  controls
                  autoPlay={playbackState.isPlaying}
                  onPlay={() => { if (!applyingRemoteRef.current && isControllerRef.current) {
                    setPlaybackState(prev => ({ ...prev, isPlaying: true }))
                    const pos = getCurrentPosition()
                    apiUpdatePlayback(roomId, { isPlaying: true, position: pos }).then(r => {
                      if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
                    }).catch(() => {})
                  }}}
                  onPause={() => { if (!applyingRemoteRef.current && isControllerRef.current) {
                    setPlaybackState(prev => ({ ...prev, isPlaying: false }))
                    const pos = getCurrentPosition()
                    apiUpdatePlayback(roomId, { isPlaying: false, position: pos }).then(r => {
                      if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
                    }).catch(() => {})
                  }}}
                  onSeeked={() => { if (!applyingRemoteRef.current && isControllerRef.current) {
                    const pos = getCurrentPosition()
                    apiUpdatePlayback(roomId, { position: pos }).then(r => {
                      if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
                    }).catch(() => {})
                  }}}
                  onError={() => setDriveIframeMode(true)}
                />
              )
            ) : (currentItem.platform === "jellyfin" || currentItem.platform === "web") ? (
              <video
                ref={videoRef}
                key={currentItem.contentId}
                src={
                  currentItem.platform === "web"
                    ? `${process.env.NEXT_PUBLIC_API_URL || "http://100.118.145.25:3001/api"}/web/stream?url=${encodeURIComponent(currentItem.contentId)}`
                    : jellyfinStreamUrl!
                }
                className="w-full h-full object-contain bg-black"
                controls
                autoPlay={playbackState.isPlaying}
                onPlay={() => { if (!applyingRemoteRef.current && isControllerRef.current) {
                  setPlaybackState(prev => ({ ...prev, isPlaying: true }))
                  const pos = getCurrentPosition()
                  apiUpdatePlayback(roomId, { isPlaying: true, position: pos }).then(r => {
                    if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
                  }).catch(() => {})
                }}}
                onPause={() => { if (!applyingRemoteRef.current && isControllerRef.current) {
                  setPlaybackState(prev => ({ ...prev, isPlaying: false }))
                  const pos = getCurrentPosition()
                  apiUpdatePlayback(roomId, { isPlaying: false, position: pos }).then(r => {
                    if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
                  }).catch(() => {})
                }}}
                onSeeked={() => { if (!applyingRemoteRef.current && isControllerRef.current) {
                  const pos = getCurrentPosition()
                  apiUpdatePlayback(roomId, { position: pos }).then(r => {
                    if (r?.playbackState?.lastUpdated) lastActionUpdateRef.current = r.playbackState.lastUpdated
                  }).catch(() => {})
                }}}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={currentItem.imageUrl || `${JELLYFIN_URL}/Items/${currentItem.contentId}/Images/Primary?api_key=${session?.token}&maxWidth=640`}
                  alt={currentItem.title}
                  className="w-full h-full object-cover opacity-40 absolute inset-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div className="relative flex flex-col items-center gap-3">
                  <Play size={48} className="text-escarlata" />
                  <p className="text-[13px] text-muted">Contenido externo</p>
                </div>
              </div>
            )}

            {/* Overlay controls */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-carbon/80 to-transparent">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={playbackState.isPlaying ? "Pausar" : "Reproducir"}
                  onClick={handlePlayPause}
                  disabled={!isController}
                  className="w-10 h-10 rounded-full bg-escarlata shadow-fab flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {playbackState.isPlaying ? <Pause size={20} className="text-blanco-calido" /> : <Play size={20} className="text-blanco-calido ml-0.5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-blanco-calido truncate drop-shadow-md">{currentItem.title}</p>
                  <p className="text-[11px] text-blanco-calido/70 capitalize">{currentItem.platform}</p>
                </div>
                {isController && currentIndex < queue.length - 1 && (
                  <button
                    type="button"
                    aria-label="Siguiente"
                    onClick={handleSkip}
                    className="w-10 h-10 rounded-full bg-carbon/60 flex items-center justify-center text-blanco-calido hover:bg-carbon/80 transition-colors"
                  >
                    <SkipForward size={18} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-carbon to-carbon-3" />
            <div className="relative flex flex-col items-center gap-3">
              <Film size={48} className="text-dim" />
              <p className="text-[13px] text-muted">Agrega contenido a la cola</p>
            </div>
          </>
        )}

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 pt-[max(0.5rem,env(safe-area-inset-top,0px))] bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-10">
          <button type="button" aria-label="Volver" onClick={() => router.push("/rooms")} className="pointer-events-auto w-9 h-9 rounded-full bg-carbon/70 backdrop-blur-md flex items-center justify-center text-blanco-calido hover:bg-carbon/90 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* Room header */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-[17px] font-[650] leading-[1.2] text-blanco-calido truncate">{room.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-dim flex items-center gap-1">
                <Hash size={10} /> Código: <span className="font-mono font-medium text-muted">{room.inviteCode}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              aria-label="Copiar invitación"
              onClick={copyLink}
              className="w-9 h-9 rounded-full bg-escarlata flex items-center justify-center hover:bg-escarlata-2 transition-colors"
            >
              {copied ? <Check size={14} className="text-blanco-calido" /> : <Share2 size={14} className="text-blanco-calido" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 px-4 overflow-x-auto shrink-0">
        {[
          { key: "chat", label: "Chat", icon: MessageCircle, badge: unreadChatCount },
          { key: "queue", label: "Cola", icon: ListMusic },
          { key: "content", label: "Contenido", icon: Film },
          { key: "info", label: "Sala", icon: Users },
        ].map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as Tab)}
            aria-label={label}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === key ? "text-escarlata border-escarlata" : "text-dim border-transparent hover:text-muted"
            }`}
          >
            <Icon size={15} />
            {label}
            {!!badge && badge > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-escarlata text-blanco-calido text-[10px] font-bold">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden overflow-x-hidden w-full max-w-full">
        {/* Chat tab */}
        {tab === "chat" && (
          <div className="flex-1 flex flex-col h-full min-h-0 justify-between relative overflow-hidden overflow-x-hidden w-full max-w-full">
            {/* Tapping message list area lowers/dismisses the keyboard */}
            <div
              onClick={handleMessageAreaClick}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full max-w-full px-4 py-2 space-y-1 scroll-smooth"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[160px] h-full text-center py-8">
                  <MessageCircle size={28} className="text-dim mb-2 animate-bounce" />
                  <p className="text-[13px] text-muted font-medium">Sin mensajes aún</p>
                  <p className="text-[12px] text-dim">Sé el primero en escribir</p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  isSelf={msg.userName === session?.userName}
                  onReply={(m) => setReplyingTo({ id: m.id, userName: m.userName, content: m.content })}
                  formatTime={formatTime}
                />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quoted reply preview bar */}
            {replyingTo && (
              <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-carbon-3/95 border-t border-white/5 text-[12px] animate-in fade-in slide-in-from-bottom-1 duration-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Reply size={14} className="text-escarlata shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-escarlata">Respondiendo a {replyingTo.userName}: </span>
                    <span className="text-dim">{replyingTo.content}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="w-5 h-5 rounded-full bg-carbon-2 flex items-center justify-center text-dim hover:text-blanco-calido shrink-0 ml-2"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Bottom input bar fixed at bottom of Chat tab */}
            <div
              className={`shrink-0 border-t border-white/5 px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] transition-all duration-300 ease-out ${
                isInputFocused
                  ? "bg-carbon-3/95 border-escarlata/40 shadow-[0_-6px_20px_rgba(230,57,70,0.15)]"
                  : "bg-carbon-2/95"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 relative flex items-center">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    maxLength={500}
                    placeholder={replyingTo ? `Responder a ${replyingTo.userName}...` : "Escribe un mensaje..."}
                    className={`w-full rounded-[14px] px-3.5 py-2 text-[14px] text-blanco-calido placeholder-dim outline-none border transition-all duration-200 ${
                      chatInput.length > 400 ? "pr-16" : "pr-3.5"
                    } ${
                      isInputFocused
                        ? "bg-carbon border-escarlata/60 ring-1 ring-escarlata/30"
                        : "bg-carbon-3 border-transparent"
                    }`}
                  />
                  {chatInput.length > 400 && (
                    <span className="absolute right-3 text-[10px] font-mono text-coral font-medium pointer-events-none">
                      {chatInput.length}/500
                    </span>
                  )}
                </div>
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => { handleSend(); scrollToBottom(); }}
                  disabled={!chatInput.trim() || sending}
                  className={`w-9 h-9 rounded-full transition-transform duration-200 ${
                    chatInput.trim() ? "scale-105 bg-escarlata text-blanco-calido shadow-sm" : ""
                  }`}
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Queue tab */}
        {tab === "queue" && (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <ListMusic size={32} className="text-dim mb-2" />
                <p className="text-[13px] text-muted">Cola vacía</p>
                <p className="text-[12px] text-dim">Agrega contenido desde la pestaña Contenido</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {queue.map((item, idx) => {
                  const isCurrent = idx === currentIndex
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-colors ${
                        isCurrent ? "bg-escarlata/10 border border-escarlata/20" : "bg-carbon-3"
                      }`}
                    >
                      <div className="w-12 h-9 rounded-[8px] bg-carbon-2 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Music size={16} className="text-dim" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium truncate ${isCurrent ? "text-escarlata" : "text-blanco-calido"}`}>
                          {isCurrent && "▶ "}{item.title}
                        </p>
                        <p className="text-[11px] text-dim flex items-center gap-2">
                          <span className="capitalize">{item.platform}</span>
                          {item.duration ? <span>· {formatDuration(item.duration)}</span> : null}
                          <span>· {item.addedBy}</span>
                        </p>
                      </div>
                      {isController && !isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFromQueue(item.id)}
                          className="w-8 h-8 rounded-full bg-carbon-2 flex items-center justify-center text-dim hover:text-coral hover:bg-carbon transition-colors shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Content tab */}
        {tab === "content" && (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {[
                { key: "jellyfin", label: "Jellyfin", icon: Film },
                { key: "youtube", label: "YouTube", icon: ({ size }: { size?: number }) => (
                  <svg viewBox="0 0 24 24" fill="currentColor" width={size || 14} height={size || 14}>
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>
                  </svg>
                ) },
                { key: "drive", label: "Google Drive", icon: HardDrive },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key as "jellyfin" | "youtube" | "drive")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] text-[12px] font-medium transition-colors ${
                    platform === key ? "bg-escarlata text-blanco-calido" : "bg-carbon-3 text-dim hover:text-muted"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowWebBrowserModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] text-[12px] font-medium bg-carbon-3 text-coral hover:bg-carbon-2 transition-colors border border-white/5 whitespace-nowrap"
              >
                <Globe size={14} />
                Navegador Web (Google)
              </button>
            </div>

            {platform === "jellyfin" && (
              <div>
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar contenido..."
                    className="w-full rounded-[14px] bg-carbon-3 pl-9 pr-3 py-2 text-[13px] text-blanco-calido placeholder-dim outline-none border border-transparent focus:border-escarlata transition-colors"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {libraries.map((lib) => (
                    <button
                      key={lib.id}
                      onClick={() => setSelectedLib(lib.id === selectedLib ? "" : lib.id)}
                      className={`px-2.5 py-1 rounded-[10px] text-[11px] font-medium transition-colors ${
                        selectedLib === lib.id ? "bg-escarlata text-blanco-calido" : "bg-carbon-3 text-dim hover:text-muted"
                      }`}
                    >
                      {lib.name}
                    </button>
                  ))}
                </div>

                {libItems.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {libItems.map((item) => {
                      const inQueue = queue.some((q) => q.contentId === item.id)
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-[14px] bg-carbon-3"
                        >
                          <div className="w-10 h-10 rounded-[10px] bg-carbon-2 flex items-center justify-center shrink-0 overflow-hidden">
                            {item.type === "Movie" || item.type === "Series" ? (
                              <img
                                src={`${JELLYFIN_URL}/Items/${item.id}/Images/Primary?api_key=${session?.token}&maxWidth=80&maxHeight=80`}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none"
                                  const parent = (e.target as HTMLImageElement).parentElement
                                  if (parent) parent.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-dim"><rect x="2" y="2" width="20" height="20" rx="2.18"/><circle cx="8" cy="8" r="2"/><path d="m22 14-5-5-9 9"/></svg>`
                                }}
                              />
                            ) : (
                              <Music size={18} className="text-dim" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-blanco-calido truncate">{item.name}</p>
                            <p className="text-[11px] text-dim">{item.year || item.type || ""}</p>
                          </div>
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => handleAddJellyfin(item)}
                            disabled={settingContent || inQueue}
                            className="w-8 h-8 !rounded-full"
                            title={inQueue ? "Ya está en la cola" : "Agregar a la cola"}
                          >
                            {settingContent ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-carbon-3/50 rounded-[20px] border border-white/5 my-2">
                    <div className="w-14 h-14 rounded-full bg-escarlata/10 border border-escarlata/20 flex items-center justify-center mb-3 text-escarlata shadow-lg shadow-escarlata/5">
                      <Film size={26} />
                    </div>
                    <h4 className="text-[14px] font-semibold text-blanco-calido mb-1">
                      {searchTerm ? "Sin resultados en Jellyfin" : "No hay contenido que reproducir"}
                    </h4>
                    <p className="text-[12px] text-muted max-w-[300px] leading-relaxed mb-4">
                      {searchTerm
                        ? `No se encontraron elementos que coincidan con "${searchTerm}".`
                        : "No hay contenido multimedia disponible en tu servidor Jellyfin o la biblioteca seleccionada no contiene elementos."}
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="px-3.5 py-1.5 rounded-[12px] bg-carbon-2 hover:bg-carbon-1 text-blanco-calido text-[12px] font-medium transition-colors border border-white/10"
                        >
                          Limpiar búsqueda
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPlatform("drive")}
                        className="px-3.5 py-1.5 rounded-[12px] bg-escarlata/20 hover:bg-escarlata/30 text-escarlata text-[12px] font-medium transition-colors border border-escarlata/30 flex items-center gap-1.5"
                      >
                        <HardDrive size={13} />
                        Usar Google Drive
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {platform === "youtube" && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-full bg-escarlata/10 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="currentColor" width={40} height={40} className="text-escarlata">
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>
                  </svg>
                </div>
                <p className="text-[15px] font-medium text-blanco-calido mb-2">Explora YouTube</p>
                <p className="text-[13px] text-muted mb-6">Navega, busca y selecciona videos para compartir en la sala</p>
                <Button onClick={() => setShowYouTubeBrowser(true)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} className="mr-2">
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/>
                  </svg>
                  Abrir YouTube
                </Button>

                <YouTubeBrowserModal
                  open={showYouTubeBrowser}
                  onClose={() => setShowYouTubeBrowser(false)}
                  onSelect={(video) => {
                    handleAddToQueue(video)
                    setShowYouTubeBrowser(false)
                  }}
                  inQueueIds={queue.filter((q) => q.platform === "youtube").map((q) => q.contentId)}
                />
              </div>
            )}

            {platform === "drive" && (
              <div className="flex flex-col items-center justify-center text-center px-4 py-4">
                <div className="w-16 h-16 rounded-full bg-escarlata/15 border border-escarlata/30 flex items-center justify-center mb-3 text-escarlata shadow-lg">
                  <HardDrive size={30} />
                </div>
                <h3 className="text-[16px] font-semibold text-blanco-calido mb-1">
                  Reproducir desde Google Drive
                </h3>
                <p className="text-[12px] text-muted max-w-sm mb-5 leading-relaxed">
                  Reproduce videos de tu cuenta de Google Drive o enlaces públicos sincronizados en tiempo real.
                </p>

                <div className="w-full max-w-md bg-carbon-3 p-4 rounded-[18px] border border-white/10 text-left space-y-3 mb-4">
                  <div>
                    <label className="block text-[12px] font-medium text-blanco-calido mb-1">
                      Enlace o ID de archivo de Google Drive
                    </label>
                    <input
                      type="text"
                      value={driveInput}
                      onChange={(e) => {
                        setDriveInput(e.target.value)
                        setDriveError(null)
                      }}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full rounded-[12px] bg-carbon-2 px-3 py-2.5 text-[13px] text-blanco-calido placeholder-dim outline-none border border-white/5 focus:border-escarlata transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-dim mb-1">
                      Título del video (opcional)
                    </label>
                    <input
                      type="text"
                      value={driveTitleInput}
                      onChange={(e) => setDriveTitleInput(e.target.value)}
                      placeholder="Ej: Mi Video de Drive.mp4"
                      className="w-full rounded-[12px] bg-carbon-2 px-3 py-2 text-[12px] text-blanco-calido placeholder-dim outline-none border border-white/5 focus:border-white/20 transition-colors"
                    />
                  </div>

                  {driveError && (
                    <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-[8px]">{driveError}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      onClick={async () => {
                        const input = driveInput.trim()
                        if (!input) {
                          setDriveError("Por favor ingresa un enlace o ID de Google Drive.")
                          return
                        }
                        const fileId = extractDriveFileId(input)
                        if (!fileId) {
                          setDriveError("El enlace ingresado no es válido para Google Drive.")
                          return
                        }
                        setDriveExtracting(true)
                        setDriveError(null)
                        try {
                          const directStreamUrl = `https://lh3.googleusercontent.com/d/${fileId}`
                          const title = driveTitleInput.trim() || `Video de Google Drive (${fileId.slice(0, 6)}...)`
                          await handleAddToQueue({
                            platform: "drive",
                            contentId: directStreamUrl,
                            title,
                          })
                          setDriveInput("")
                          setDriveTitleInput("")
                        } catch {
                          setDriveError("Error al agregar el video.")
                        } finally {
                          setDriveExtracting(false)
                        }
                      }}
                      disabled={driveExtracting || !driveInput.trim()}
                      className="flex-1 text-[13px]"
                    >
                      {driveExtracting ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" />}
                      Agregar a la Cola
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowDriveModal(true)}
                      className="px-3.5 py-2 rounded-[14px] bg-carbon-2 hover:bg-carbon-1 text-blanco-calido text-[12px] font-medium transition-colors border border-white/10"
                    >
                      Asistente
                    </button>
                  </div>
                </div>

                <GoogleDriveModal
                  open={showDriveModal}
                  onClose={() => setShowDriveModal(false)}
                  onSelect={(video) => {
                    handleAddToQueue(video)
                    setShowDriveModal(false)
                  }}
                  inQueueIds={queue.filter((q) => q.platform === "drive").map((q) => q.contentId)}
                />
              </div>
            )}
          </div>
        )}

        {/* Info tab */}
        {tab === "info" && (
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">
            <div>
              <h3 className="text-[12px] font-semibold text-dim uppercase tracking-wider mb-2">Código de invitación</h3>
              <div className="flex items-center gap-3 bg-carbon-3 rounded-[14px] px-4 py-3">
                <span className="font-mono text-[20px] font-bold tracking-[0.15em] text-blanco-calido">{room.inviteCode}</span>
                <button
                  onClick={copyLink}
                  className="ml-auto w-9 h-9 rounded-full bg-escarlata flex items-center justify-center hover:bg-escarlata-2 transition-colors"
                >
                  {copied ? <Check size={14} className="text-blanco-calido" /> : <Copy size={14} className="text-blanco-calido" />}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold text-dim uppercase tracking-wider mb-2">Creada por</h3>
              <div className="flex items-center gap-3 bg-carbon-3 rounded-[14px] px-4 py-3">
                <Avatar name={room.createdBy} size={36} />
                <span className="text-[14px] font-medium text-blanco-calido">{room.createdBy}</span>
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold text-dim uppercase tracking-wider mb-2">
                Miembros ({room.participants?.length || room.participantCount})
              </h3>
              <div className="space-y-1.5">
                {(room.participants || []).length === 0 ? (
                  <div className="bg-carbon-3 rounded-[14px] px-4 py-3">
                    <p className="text-[13px] text-muted">Sin miembros</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {room.participants!.map((p) => {
                      const isCtrl = p.userId === room.controllerUserId
                      const isSelf = p.userId === session?.userId
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-3 bg-carbon-3 rounded-[14px] px-4 py-3"
                        >
                          <Avatar name={p.userName} size={32} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-blanco-calido truncate flex items-center gap-1.5">
                              {p.userName}
                              {isCtrl && (
                                <span title="Controlador de la sala" className="text-amber-400 shrink-0">
                                  <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                  </svg>
                                </span>
                              )}
                            </p>
                          </div>
                          {isController && !isSelf && (
                            <button
                              type="button"
                              onClick={async () => {
                                await transferControl(room.id, p.userId)
                                loadRoom()
                              }}
                              className="shrink-0 px-3 py-1.5 rounded-[10px] bg-amber-400/10 text-amber-400 text-[11px] font-medium hover:bg-amber-400/20 transition-colors"
                              title="Transferir control"
                            >
                              Dar corona
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {currentItem && (
              <div>
                <h3 className="text-[12px] font-semibold text-dim uppercase tracking-wider mb-2">Reproduciendo ahora</h3>
                <div className="bg-carbon-3 rounded-[14px] px-4 py-3">
                  <p className="text-[14px] font-medium text-blanco-calido truncate">{currentItem.title}</p>
                  <p className="text-[12px] text-dim capitalize">{currentItem.platform}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-[12px] font-semibold text-dim uppercase tracking-wider mb-2">Cola ({queue.length})</h3>
              <div className="bg-carbon-3 rounded-[14px] px-4 py-3">
                {queue.length === 0 ? (
                  <p className="text-[13px] text-muted">Sin contenido en cola</p>
                ) : (
                  <div className="space-y-1.5">
                    {queue.slice(0, 5).map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 text-[13px]">
                        <span className={`w-5 text-center text-[11px] font-mono ${idx === currentIndex ? "text-escarlata" : "text-dim"}`}>
                          {idx === currentIndex ? "▶" : `${idx + 1}.`}
                        </span>
                        <span className={`truncate ${idx === currentIndex ? "text-escarlata font-medium" : "text-blanco-calido"}`}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                    {queue.length > 5 && (
                      <p className="text-[12px] text-dim mt-1">... y {queue.length - 5} más</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button variant="ghost" className="w-full text-dim hover:text-coral" onClick={handleLeave}>
              <LogOut size={16} className="mr-2" />
              Abandonar sala
            </Button>
          </div>
        )}
      </div>

      {/* Web Media Browser Modal */}
      <WebBrowserModal
        open={showWebBrowserModal}
        onClose={() => setShowWebBrowserModal(false)}
        onSelect={handleAddToQueue}
      />

      {/* YouTube Browser Modal */}
      <YouTubeBrowserModal
        open={showYouTubeBrowser}
        onClose={() => setShowYouTubeBrowser(false)}
        onSelect={handleAddToQueue}
        inQueueIds={queue.map((i) => i.contentId)}
      />
    </div>
  )
}
