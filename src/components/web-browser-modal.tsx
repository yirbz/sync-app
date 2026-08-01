"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { apiExtractWebMedia } from "@/lib/api"
import {
  Globe, RotateCw, Home, Search, X, Play,
  Check, Loader2, ExternalLink, Sparkles, Link2, Maximize2,
  ArrowLeft, Shield, Clipboard
} from "lucide-react"

interface WebBrowserModalProps {
  open: boolean
  onClose: () => void
  onSelect: (item: { platform: string; contentId: string; title: string; imageUrl?: string }) => void
  inQueueUrls?: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://100.118.145.25:3001/api"
const DEFAULT_HOMEPAGE = "https://www.google.com/search?q=videos+online&igu=1"

function formatTargetUrl(input: string): string {
  const target = input.trim()
  if (!target) return DEFAULT_HOMEPAGE

  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target
  }
  if (target.includes(".") && !target.includes(" ")) {
    return `https://${target}`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(target)}&igu=1`
}

/**
 * Multi-strategy iframe URL resolver.
 * Priority:
 *   1. Google search → pass through directly (igu=1 makes it embeddable)
 *   2. Known video platforms → use their official embed URLs (bypasses Cloudflare entirely)
 *   3. Everything else → server-side proxy
 */
function getEmbedUrl(targetUrl: string): string | null {
  // YouTube embed (always works, no Cloudflare)
  const ytWatch = targetUrl.match(/youtube\.com\/watch\?.*v=([^"&?\s]{11})/)
  const ytShort = targetUrl.match(/youtu\.be\/([^"&?\s]{11})/)
  const ytId = ytWatch?.[1] || ytShort?.[1]
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`

  // Vimeo embed
  const vimeoMatch = targetUrl.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  // Dailymotion embed
  const dmMatch = targetUrl.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/)
  if (dmMatch) return `https://www.dailymotion.com/embed/video/${dmMatch[1]}`

  // Google Drive preview (official embed, no bot check)
  const driveMatch = targetUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`

  // Twitch embed
  const twitchMatch = targetUrl.match(/twitch\.tv\/videos\/(\d+)/)
  if (twitchMatch) return `https://player.twitch.tv/?video=v${twitchMatch[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`

  const twitchChannel = targetUrl.match(/twitch\.tv\/([a-zA-Z0-9_]+)$/)
  if (twitchChannel && !['videos', 'clip', 'directory'].includes(twitchChannel[1])) {
    return `https://player.twitch.tv/?channel=${twitchChannel[1]}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`
  }

  return null
}

function getIframeUrl(targetUrl: string): string {
  // 1. Google search passes through directly
  if (targetUrl.includes("google.com/search") && targetUrl.includes("igu=1")) {
    return targetUrl
  }

  // 2. Known platforms use their official embed URLs (no proxy, no Cloudflare)
  const embedUrl = getEmbedUrl(targetUrl)
  if (embedUrl) return embedUrl

  // 3. Everything else goes through our server proxy
  return `${API_URL}/web/proxy?url=${encodeURIComponent(targetUrl)}`
}

/**
 * Smart media extractor: parses URLs to see if it's YouTube, Google Drive, direct MP4/HLS, or standard web stream.
 */
function detectMediaFromUrl(rawUrl: string): { platform: string; contentId: string; title: string } | null {
  if (!rawUrl) return null
  const url = rawUrl.trim()

  // 1. YouTube Match
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
  if (ytMatch && ytMatch[1]) {
    return {
      platform: "youtube",
      contentId: ytMatch[1],
      title: "Video de YouTube",
    }
  }

  // 2. Direct Video or Stream URL (.mp4, .m3u8, .webm, .ogg, .mov)
  const isDirectStream = /\.(mp4|m3u8|webm|ogg|mov)(\?.*)?$/i.test(url)
  if (isDirectStream) {
    const filename = url.split("/").pop()?.split("?")[0] || "Stream de Video"
    return {
      platform: "web",
      contentId: url,
      title: decodeURIComponent(filename),
    }
  }

  // 3. Google Drive Match
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch && driveMatch[1]) {
    return {
      platform: "drive",
      contentId: driveMatch[1],
      title: "Video de Google Drive",
    }
  }

  return null
}

export function WebBrowserModal({ open, onClose, onSelect }: WebBrowserModalProps) {
  const [urlInput, setUrlInput] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sync_last_web_url")
      if (saved) return saved
    }
    return "google.com"
  })

  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sync_last_web_url")
      if (saved) return formatTargetUrl(saved)
    }
    return DEFAULT_HOMEPAGE
  })

  const [iframeSrc, setIframeSrc] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sync_last_web_url")
      if (saved) return getIframeUrl(formatTargetUrl(saved))
    }
    return DEFAULT_HOMEPAGE
  })

  const [extracting, setExtracting] = useState(false)
  const [extractedMedia, setExtractedMedia] = useState<{ platform: string; mediaUrl: string; title: string } | null>(null)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [fullscreenActive, setFullscreenActive] = useState(false)

  // "Browsing externally" state — when user is in the native browser
  const [browsingExternally, setBrowsingExternally] = useState(false)
  const [siteBlocked, setSiteBlocked] = useState(false)
  const [blockedUrl, setBlockedUrl] = useState("")

  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleMediaDetected = useCallback((mediaUrl: string, title?: string, platform = "web") => {
    setExtractedMedia({
      platform,
      mediaUrl,
      title: title || "Video Web Detectado",
    })
    setExtractError(null)
    setBrowsingExternally(false)
    setSiteBlocked(false)
  }, [])

  // Auto-detect media from current URL
  useEffect(() => {
    const direct = detectMediaFromUrl(currentUrl)
    if (direct) {
      const timer = setTimeout(() => {
        handleMediaDetected(direct.contentId, direct.title, direct.platform)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [currentUrl, handleMediaDetected])

  // Listen for iframe postMessage, Fullscreen, and Visibility events
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!event.data) return

      if (event.data.type === "SYNC_NAVIGATED") {
        const { url } = event.data
        if (url && !url.includes("google.com/search")) {
          setCurrentUrl(url)
          setUrlInput(url)
          if (typeof window !== "undefined") {
            sessionStorage.setItem("sync_last_web_url", url)
          }
        }
      }

      if (event.data.type === "SYNC_VIDEO_DETECTED") {
        const { mediaUrl, title, pageUrl, platform } = event.data
        if (mediaUrl) {
          handleMediaDetected(mediaUrl, title, platform || "web")
          if (pageUrl) {
            setCurrentUrl(pageUrl)
            setUrlInput(pageUrl)
            if (typeof window !== "undefined") {
              sessionStorage.setItem("sync_last_web_url", pageUrl)
            }
          }
        }
      }

      // Server proxy detected Cloudflare/bot protection → show native browser flow
      if (event.data.type === "SYNC_BLOCKED") {
        const { url } = event.data
        setSiteBlocked(true)
        setBlockedUrl(url || currentUrl)
      }

      // "Open in native browser" button pressed inside the blocked iframe
      if (event.data.type === "SYNC_OPEN_NATIVE") {
        const { url } = event.data
        const target = url || currentUrl
        setBrowsingExternally(true)
        setSiteBlocked(false)
        window.open(target, "_blank", "noopener,noreferrer")
      }

      // "I already copied the link" button pressed inside the blocked iframe
      if (event.data.type === "SYNC_PASTE_LINK") {
        handlePasteFromClipboard()
      }
    }

    function handleFullscreenChange() {
      const doc = document as unknown as { webkitFullscreenElement?: Element }
      const isFS = !!(document.fullscreenElement || doc.webkitFullscreenElement)
      setFullscreenActive(isFS)
      if (isFS && currentUrl) {
        const parsed = detectMediaFromUrl(currentUrl)
        if (parsed) {
          handleMediaDetected(parsed.contentId, parsed.title, parsed.platform)
        }
      }
    }

    // When user returns from native browser, prompt clipboard paste
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && browsingExternally) {
        // Don't auto-read clipboard (requires user gesture on iOS).
        // Just keep the "browsing externally" banner visible — user taps "Pegar enlace".
      }
    }

    window.addEventListener("message", handleMessage)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("message", handleMessage)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [currentUrl, handleMediaDetected, browsingExternally])

  if (!open) return null

  const handleNavigate = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const target = formatTargetUrl(urlInput)
    setCurrentUrl(target)
    setIframeSrc(getIframeUrl(target))
    setExtractedMedia(null)
    setExtractError(null)
    setSiteBlocked(false)
    setBrowsingExternally(false)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("sync_last_web_url", target)
    }

    const parsed = detectMediaFromUrl(target)
    if (parsed) {
      handleMediaDetected(parsed.contentId, parsed.title, parsed.platform)
    }
  }

  const handleOpenNativeBrowser = (urlOverride?: string) => {
    const target = urlOverride || formatTargetUrl(currentUrl || urlInput)
    setBrowsingExternally(true)
    setSiteBlocked(false)
    window.open(target, "_blank", "noopener,noreferrer")
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && (text.startsWith("http://") || text.startsWith("https://") || text.includes("."))) {
        const cleanText = text.trim()
        setUrlInput(cleanText)
        const target = formatTargetUrl(cleanText)
        setCurrentUrl(target)
        setIframeSrc(getIframeUrl(target))
        setBrowsingExternally(false)
        setSiteBlocked(false)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sync_last_web_url", target)
        }

        const parsed = detectMediaFromUrl(target)
        if (parsed) {
          handleMediaDetected(parsed.contentId, parsed.title, parsed.platform)
        } else {
          handleExtractMedia(target)
        }
      }
    } catch {}
  }

  const handleHome = () => {
    setUrlInput("google.com")
    setCurrentUrl(DEFAULT_HOMEPAGE)
    setIframeSrc(DEFAULT_HOMEPAGE)
    setExtractedMedia(null)
    setExtractError(null)
    setSiteBlocked(false)
    setBrowsingExternally(false)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sync_last_web_url")
    }
  }

  const handleReload = () => {
    if (iframeRef.current) {
      setSiteBlocked(false)
      iframeRef.current.src = getIframeUrl(currentUrl)
    }
  }

  const handleExtractMedia = async (targetOverride?: string) => {
    const urlToExtract = targetOverride || currentUrl
    setExtracting(true)
    setExtractError(null)

    const direct = detectMediaFromUrl(urlToExtract)
    if (direct) {
      handleMediaDetected(direct.contentId, direct.title, direct.platform)
      setExtracting(false)
      return
    }

    try {
      const res = await apiExtractWebMedia(urlToExtract)
      if (res && res.success && res.mediaUrl) {
        handleMediaDetected(res.mediaUrl, res.title || "Video Web", res.platform || "web")
      } else {
        setExtractError("No se encontró video. Abre en el navegador nativo, copia el enlace del video y pégalo aquí.")
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      setExtractError(errorObj?.message || "Error al extraer el video")
    } finally {
      setExtracting(false)
    }
  }

  const handleAddToRoom = () => {
    if (!extractedMedia) return
    setAdded(true)
    onSelect({
      platform: extractedMedia.platform,
      contentId: extractedMedia.mediaUrl,
      title: extractedMedia.title,
    })
    setTimeout(() => {
      setAdded(false)
      setExtractedMedia(null)
      onClose()
    }, 400)
  }

  // Check if current URL would use a known embed (i.e. bypasses proxy)
  const isUsingEmbed = !!getEmbedUrl(currentUrl)

  return (
    <div className="fixed inset-0 z-[70] bg-carbon flex flex-col pt-[env(safe-area-inset-top,0px)]">
      {/* Top Browser Bar */}
      <div className="shrink-0 border-b border-white/5 bg-carbon-2/95 backdrop-blur-md px-3 py-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-escarlata/15 flex items-center justify-center shrink-0 text-escarlata">
            <Globe size={16} />
          </div>

          {/* Navigation Controls */}
          <button
            type="button"
            onClick={handleHome}
            className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido transition-colors shrink-0"
            title="Inicio Google"
          >
            <Home size={15} />
          </button>
          <button
            type="button"
            onClick={handleReload}
            className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido transition-colors shrink-0"
            title="Recargar"
          >
            <RotateCw size={14} />
          </button>

          {/* Address / Search Bar */}
          <form onSubmit={handleNavigate} className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Ingresa tu URL o busca en Google..."
              className="w-full rounded-full bg-carbon-3 pl-8 pr-8 py-1.5 text-[13px] text-blanco-calido placeholder-dim outline-none border border-white/10 focus:border-escarlata/50 transition-colors"
            />
            {urlInput && (
              <button
                type="button"
                onClick={() => setUrlInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-blanco-calido"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* Native Browser Button */}
          <button
            type="button"
            onClick={() => handleOpenNativeBrowser()}
            className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-coral hover:bg-carbon-2 transition-colors shrink-0"
            title="Abrir en navegador nativo del móvil"
          >
            <ExternalLink size={15} />
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-carbon-3 flex items-center justify-center text-dim hover:text-blanco-calido shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status indicator & Native Actions bar */}
        <div className="flex items-center justify-between px-1 text-[11px]">
          <button
            type="button"
            onClick={() => handleOpenNativeBrowser()}
            className="text-coral hover:underline font-medium flex items-center gap-1"
          >
            <ExternalLink size={12} /> {isUsingEmbed ? "Embed directo activo" : "Abrir en Safari/Chrome nativo"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-2.5 py-1 rounded-full bg-carbon-3 text-blanco-calido hover:bg-carbon-2 transition-colors flex items-center gap-1"
            >
              <Link2 size={12} className="text-escarlata" /> Pegar enlace
            </button>

            <button
              type="button"
              onClick={() => handleExtractMedia()}
              disabled={extracting}
              className="px-2.5 py-1 rounded-full bg-escarlata/20 border border-escarlata/40 text-coral font-semibold hover:bg-escarlata/30 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {extracting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Detectar video
            </button>
          </div>
        </div>
      </div>

      {/* Extracted media overlay banner */}
      {extractedMedia && (
        <div className="shrink-0 bg-carbon-3 border-b border-escarlata/30 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-escarlata/20 flex items-center justify-center shrink-0 text-escarlata animate-pulse">
              <Play size={16} fill="currentColor" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-coral px-1.5 py-0.2 rounded bg-carbon-2 uppercase">
                  {extractedMedia.platform}
                </span>
                <p className="text-[13px] font-semibold text-blanco-calido truncate">🎬 {extractedMedia.title}</p>
              </div>
              <p className="text-[11px] text-dim truncate">{extractedMedia.mediaUrl}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToRoom}
            disabled={added}
            className="px-3.5 py-1.5 rounded-full bg-escarlata text-blanco-calido text-[12px] font-semibold hover:bg-escarlata-2 shadow-fab transition-transform active:scale-95 shrink-0 flex items-center gap-1"
          >
            {added ? <Check size={14} /> : <Play size={14} fill="currentColor" />}
            {added ? "Sincronizado" : "Ver en Sync"}
          </button>
        </div>
      )}

      {/* "Browsing externally" banner — shown when user opened native browser */}
      {browsingExternally && !extractedMedia && (
        <div className="shrink-0 bg-gradient-to-r from-carbon-3 to-carbon-2 border-b border-escarlata/20 p-4 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-escarlata/15 flex items-center justify-center shrink-0">
              <ExternalLink size={20} className="text-escarlata" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-blanco-calido">Navegando externamente</p>
              <p className="text-[12px] text-dim">Copia el enlace del video y vuelve aquí</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="flex-1 px-4 py-2.5 rounded-[14px] bg-escarlata text-blanco-calido text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-fab"
            >
              <Clipboard size={16} /> Pegar enlace copiado
            </button>
            <button
              type="button"
              onClick={() => setBrowsingExternally(false)}
              className="px-3 py-2.5 rounded-[14px] bg-carbon-3 text-dim text-[13px] border border-white/5 active:scale-[0.97] transition-transform"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Alert Banner */}
      {fullscreenActive && !extractedMedia && (
        <div className="shrink-0 bg-escarlata/20 border-b border-escarlata/40 p-2.5 px-4 flex items-center justify-between text-[12px] text-blanco-calido">
          <div className="flex items-center gap-2">
            <Maximize2 size={14} className="text-escarlata animate-pulse" />
            <span>Pantalla completa detectada. Haz clic para sincronizar este video en la sala.</span>
          </div>
          <button
            type="button"
            onClick={() => handleExtractMedia()}
            className="px-3 py-1 rounded-full bg-escarlata text-white text-[11px] font-bold"
          >
            Sincronizar Video
          </button>
        </div>
      )}

      {extractError && (
        <div className="shrink-0 bg-coral/10 border-b border-coral/20 px-3 py-1.5 text-[12px] text-coral text-center">
          {extractError}
        </div>
      )}

      {/* Protected Embedded Web Frame */}
      <div className="flex-1 relative bg-white">
        {browsingExternally ? (
          // Show a "waiting for return" screen instead of the iframe
          <div className="w-full h-full bg-carbon flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-escarlata/10 flex items-center justify-center mb-5">
              <Globe size={32} className="text-escarlata animate-pulse" />
            </div>
            <p className="text-[16px] font-semibold text-blanco-calido mb-2">Buscando en el navegador nativo</p>
            <p className="text-[13px] text-dim max-w-[280px] mb-6 leading-relaxed">
              Encuentra el video que quieres sincronizar, copia su URL desde la barra de dirección o botón de compartir, y vuelve aquí.
            </p>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="px-6 py-3 rounded-[16px] bg-escarlata text-blanco-calido text-[14px] font-bold flex items-center gap-2 shadow-fab active:scale-[0.97] transition-transform mb-3"
            >
              <Clipboard size={18} /> Pegar enlace del video
            </button>
            <button
              type="button"
              onClick={() => setBrowsingExternally(false)}
              className="text-[13px] text-dim hover:text-blanco-calido transition-colors"
            >
              Volver al navegador integrado
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="Web Media Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            className="w-full h-full border-none"
          />
        )}
      </div>
    </div>
  )
}
