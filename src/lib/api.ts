export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const session = JSON.parse(localStorage.getItem("sync_session") || "{}")
    return session?.token || null
  } catch {
    return null
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Timeout: abort after 12 seconds
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === "AbortError") {
      throw new Error("La solicitud tardó demasiado. Verifica tu conexión a internet e inténtalo de nuevo.")
    }
    throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.")
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sync_session")
        window.dispatchEvent(new CustomEvent("sync_session_expired"))
      }
      throw new Error("Tu sesión ha caducado. Por favor, inicia sesión de nuevo para continuar.")
    }

    if (res.status === 502 || res.status === 503) {
      throw new Error("El servidor está teniendo una pausa breve de conexión. Inténtalo de nuevo en unos segundos.")
    }

    let errorBody: any = null
    try { errorBody = await res.json() } catch {}
    throw new Error(errorBody?.error || errorBody?.message || `No se pudo completar la solicitud (${res.status})`)
  }

  try {
    return await res.json()
  } catch {
    throw new Error("El servidor respondió con datos inesperados. Inténtalo de nuevo.")
  }
}

export interface RoomDTO {
  id: string
  name: string
  syncplayGroupId: string
  createdBy: string
  createdByUserId: string
  controllerUserId?: string
  inviteCode: string
  itemIds: string[]
  currentItem: { platform: string; id: string; title: string } | null
  status: string
  createdAt: string
  updatedAt: string
  participantCount?: number
  participants?: { id: string; userId: string; userName: string }[]
}

export interface ChatMessageDTO {
  id: string
  roomId: string
  userId: string
  userName: string
  content: string
  replyToId?: string | null
  replyToUserName?: string | null
  replyToContent?: string | null
  createdAt: string
}

export async function apiGetRooms(): Promise<RoomDTO[]> {
  return request("/rooms")
}

export async function apiCreateRoom(data: {
  name: string
  itemIds?: string[]
}): Promise<RoomDTO> {
  return request("/rooms", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function apiGetRoomByInviteCode(code: string): Promise<RoomDTO> {
  return request(`/rooms/join/${code}`)
}

export async function apiJoinRoom(roomId: string): Promise<RoomDTO> {
  return request(`/rooms/${roomId}/join`, { method: "POST" })
}

export async function apiLeaveRoom(roomId: string): Promise<{ success: boolean }> {
  return request(`/rooms/${roomId}/leave`, { method: "POST" })
}

export async function apiGetRoom(roomId: string): Promise<RoomDTO> {
  return request(`/rooms/${roomId}`)
}

export async function apiDeleteRoom(roomId: string): Promise<{ success: boolean }> {
  return request(`/rooms/${roomId}`, { method: "DELETE" })
}

export async function apiUpdateRoom(roomId: string, data: Partial<{ name: string; status: string; itemIds: string[]; currentItem: any }>): Promise<RoomDTO> {
  return request(`/rooms/${roomId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function apiTransferControl(roomId: string, controllerUserId: string): Promise<{ controllerUserId: string }> {
  return request(`/rooms/${roomId}/controller`, {
    method: "PATCH",
    body: JSON.stringify({ controllerUserId }),
  })
}

export async function apiGetMessages(roomId: string, limit = 50): Promise<ChatMessageDTO[]> {
  return request(`/chat/${roomId}?limit=${limit}`)
}

export async function apiSendMessage(
  roomId: string,
  content: string,
  replyTo?: { id: string; userName: string; content: string }
): Promise<ChatMessageDTO> {
  return request(`/chat/${roomId}`, {
    method: "POST",
    body: JSON.stringify({
      content,
      replyToId: replyTo?.id,
      replyToUserName: replyTo?.userName,
      replyToContent: replyTo?.content,
    }),
  })
}

export async function apiHealth(): Promise<{ status: string }> {
  return request("/health")
}

// --- Queue ---

export interface QueueItemDTO {
  id: string
  platform: string
  contentId: string
  title: string
  duration?: number
  imageUrl?: string
  addedBy: string
  addedAt: string
}

export interface PlaybackStateDTO {
  position: number
  isPlaying: boolean
  lastUpdated?: string
}

export async function apiGetQueue(roomId: string): Promise<{ queue: QueueItemDTO[]; currentIndex: number; playbackState: PlaybackStateDTO; currentItem: any }> {
  return request(`/rooms/${roomId}/queue`)
}

export async function apiAddToQueue(roomId: string, item: { platform: string; contentId: string; title: string; duration?: number; imageUrl?: string }): Promise<{ queue: QueueItemDTO[]; currentIndex: number }> {
  return request(`/rooms/${roomId}/queue`, {
    method: "POST",
    body: JSON.stringify(item),
  })
}

export async function apiRemoveFromQueue(roomId: string, itemId: string): Promise<{ queue: QueueItemDTO[]; currentIndex: number }> {
  return request(`/rooms/${roomId}/queue/${itemId}`, {
    method: "DELETE",
  })
}

export async function apiReorderQueue(roomId: string, fromIndex: number, toIndex: number): Promise<{ queue: QueueItemDTO[] }> {
  return request(`/rooms/${roomId}/queue/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ fromIndex, toIndex }),
  })
}

export async function apiUpdatePlayback(roomId: string, state: { position?: number; isPlaying?: boolean; currentIndex?: number }): Promise<{ currentIndex: number; currentItem: any; playbackState: PlaybackStateDTO }> {
  return request(`/rooms/${roomId}/playback`, {
    method: "PATCH",
    body: JSON.stringify(state),
  })
}

// --- YouTube ---

export interface YouTubeVideoDTO {
  id: string
  title: string
  description: string
  channelTitle: string
  channelId: string
  thumbnails: Record<string, { url: string; width: number; height: number }>
  publishedAt: string
  duration: number
}

export async function apiYouTubeTrending(maxResults = 20, category?: string): Promise<{ items: YouTubeVideoDTO[]; nextPageToken: string | null }> {
  let path = `/youtube/trending?maxResults=${maxResults}`
  if (category) path += `&category=${category}`
  return request(path)
}

export async function apiYouTubeSearch(q: string, maxResults = 15): Promise<{ items: YouTubeVideoDTO[]; nextPageToken: string | null }> {
  return request(`/youtube/search?q=${encodeURIComponent(q)}&maxResults=${maxResults}`)
}

// --- Web Media Extractor ---

export interface WebMediaDTO {
  success: boolean
  mediaUrl: string
  title: string
  platform: string
}

export async function apiExtractWebMedia(url: string): Promise<WebMediaDTO> {
  return request("/web/extract", {
    method: "POST",
    body: JSON.stringify({ url }),
  })
}

export async function apiYouTubeVideo(id: string): Promise<YouTubeVideoDTO> {
  return request(`/youtube/video?id=${id}`)
}
