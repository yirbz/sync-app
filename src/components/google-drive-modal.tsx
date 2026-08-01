"use client"

import { useState } from "react"
import { apiExtractWebMedia } from "@/lib/api"
import { extractDriveFileId } from "@/lib/drive"
import {
  HardDrive, X, Link2, Check, Loader2, Play, Info, Sparkles,
  HelpCircle, Copy, AlertCircle, FileVideo
} from "lucide-react"

interface GoogleDriveModalProps {
  open: boolean
  onClose: () => void
  onSelect: (item: { platform: string; contentId: string; title: string; imageUrl?: string }) => void
  inQueueIds?: string[]
}

export function GoogleDriveModal({ open, onClose, onSelect }: GoogleDriveModalProps) {
  const [driveInput, setDriveInput] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [extractedInfo, setExtractedInfo] = useState<{
    fileId: string
    title: string
    mediaUrl: string
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  if (!open) return null

  const handleExtract = async (inputVal?: string) => {
    const target = (inputVal || driveInput).trim()
    if (!target) {
      setErrorMsg("Por favor ingresa un enlace o ID de archivo de Google Drive.")
      return
    }

    const fileId = extractDriveFileId(target)
    if (!fileId) {
      setErrorMsg("El enlace ingresado no parece un enlace válido de Google Drive o un ID de archivo.")
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setExtractedInfo(null)

    try {
      // Extract title from backend API
      const res = await apiExtractWebMedia(`https://drive.google.com/file/d/${fileId}/view`)
      const title = customTitle.trim() || res?.title || `Video de Google Drive (${fileId.slice(0, 6)}...)`
      const mediaUrl = `https://lh3.googleusercontent.com/d/${fileId}`

      setExtractedInfo({
        fileId,
        title,
        mediaUrl,
      })
      if (!customTitle && res?.title) {
        setCustomTitle(res.title)
      }
    } catch {
      // Fallback if network issue
      const title = customTitle.trim() || `Video de Google Drive (${fileId.slice(0, 6)}...)`
      setExtractedInfo({
        fileId,
        title,
        mediaUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setDriveInput(text)
        handleExtract(text)
      }
    } catch {
      setErrorMsg("No se pudo acceder al portapapeles. Pega el enlace manualmente.")
    }
  }

  const handleAdd = () => {
    if (!extractedInfo) return
    setAdded(true)
    onSelect({
      platform: "drive",
      contentId: extractedInfo.mediaUrl,
      title: customTitle.trim() || extractedInfo.title,
    })
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-carbon-2 border border-white/10 rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-carbon-3/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-escarlata/15 border border-escarlata/30 flex items-center justify-center text-escarlata shrink-0">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-blanco-calido flex items-center gap-2">
                Google Drive
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-escarlata/20 text-escarlata border border-escarlata/30">
                  Multimedia
                </span>
              </h3>
              <p className="text-[12px] text-muted">Reproduce videos subidos a tu Drive o públicos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-carbon-3 text-dim hover:text-blanco-calido flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Input Section */}
          <div>
            <label className="block text-[13px] font-medium text-blanco-calido mb-2 flex items-center justify-between">
              <span>Enlace o ID de archivo de Google Drive</span>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[11px] text-coral hover:underline flex items-center gap-1 font-normal"
              >
                <Copy size={12} />
                Pegar del portapapeles
              </button>
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
                <input
                  type="text"
                  value={driveInput}
                  onChange={(e) => {
                    setDriveInput(e.target.value)
                    setErrorMsg(null)
                  }}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full rounded-[14px] bg-carbon-3 pl-10 pr-3 py-3 text-[13px] text-blanco-calido placeholder-dim outline-none border border-white/5 focus:border-escarlata transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                />
              </div>

              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={loading || !driveInput.trim()}
                className="px-4 py-3 rounded-[14px] bg-escarlata hover:bg-escarlata-2 disabled:opacity-40 text-blanco-calido text-[13px] font-semibold flex items-center gap-2 transition-all shrink-0"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Verificar
              </button>
            </div>
          </div>

          {/* Custom title (optional) */}
          <div>
            <label className="block text-[12px] font-medium text-dim mb-1.5">
              Título del video (opcional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Ej: Mi Película de Vacaciones.mp4"
              className="w-full rounded-[12px] bg-carbon-3 px-3.5 py-2.5 text-[13px] text-blanco-calido placeholder-dim outline-none border border-white/5 focus:border-white/20 transition-colors"
            />
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3 rounded-[14px] bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[12px] flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Extracted Video Card Preview */}
          {extractedInfo && (
            <div className="p-4 rounded-[16px] bg-carbon-3 border border-escarlata/40 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[12px] bg-escarlata/20 flex items-center justify-center text-escarlata shrink-0">
                  <FileVideo size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-semibold text-blanco-calido truncate">{extractedInfo.title}</h4>
                  <p className="text-[11px] text-dim truncate font-mono">ID: {extractedInfo.fileId}</p>
                </div>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Listo
                </span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-muted">Sincronización en tiempo real habilitada</span>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={added}
                  className="px-4 py-2 rounded-[12px] bg-escarlata hover:bg-escarlata-2 text-blanco-calido text-[12px] font-semibold flex items-center gap-1.5 transition-all shadow-md"
                >
                  {added ? <Check size={14} /> : <Play size={14} />}
                  {added ? "¡Agregado!" : "Agregar a la Sala"}
                </button>
              </div>
            </div>
          )}

          {/* Quick instructions guide toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[12px] font-medium text-dim hover:text-blanco-calido flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle size={14} className="text-escarlata" />
              ¿Cómo compartir un video desde tu cuenta de Google Drive?
            </button>

            {showGuide && (
              <div className="mt-3 p-4 rounded-[16px] bg-carbon-3/70 border border-white/10 text-[12px] space-y-2 text-muted leading-relaxed">
                <p className="font-semibold text-blanco-calido mb-1 flex items-center gap-1.5">
                  <Info size={14} className="text-coral" />
                  Instrucciones paso a paso:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1">
                  <li>Ingresa a tu cuenta en <strong className="text-blanco-calido">Google Drive</strong>.</li>
                  <li>Ubica el archivo de video y haz clic secundario (o en los 3 puntos) &rarr; <strong className="text-blanco-calido">Compartir</strong>.</li>
                  <li>En el apartado <strong className="text-blanco-calido">Acceso general</strong>, cambia de "Restringido" a <strong className="text-escarlata">"Cualquier persona con el enlace"</strong>.</li>
                  <li>Haz clic en <strong className="text-blanco-calido">Copiar enlace</strong> y pégalo arriba.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-carbon-3/50 flex items-center justify-between text-[12px]">
          <span className="text-dim">Compatible con MP4, WEBM, MKV, MOV</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[12px] bg-carbon-3 hover:bg-carbon-1 text-muted hover:text-blanco-calido font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
