const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const session = JSON.parse(localStorage.getItem("sync_session") || "{}")
    return session.token || null
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

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Error de conexión" }))
    throw new Error(error.error || `Error ${res.status}`)
  }

  return res.json()
}

export interface RoomDTO {
  id: string
  name: string
  syncplayGroupId: string
  createdBy: string
  createdByUserId: string
  inviteCode: string
  itemIds: string[]
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
  createdAt: string
}

// Rooms
export async function apiGetRooms(): Promise<RoomDTO[]> {
  return request("/rooms")
}

export async function apiCreateRoom(data: {
  name: string
  syncplayGroupId: string
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

export async function apiGetRoom(roomId: string): Promise<RoomDTO & { participants: { id: string; userId: string; userName: string }[] }> {
  return request(`/rooms/${roomId}`)
}

export async function apiUpdateRoom(roomId: string, data: Partial<{ status: string; itemIds: string[] }>): Promise<RoomDTO> {
  return request(`/rooms/${roomId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

// Chat
export async function apiGetMessages(roomId: string, limit = 50): Promise<ChatMessageDTO[]> {
  return request(`/chat/${roomId}?limit=${limit}`)
}

export async function apiSendMessage(roomId: string, content: string): Promise<ChatMessageDTO> {
  return request(`/chat/${roomId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  })
}

// Health
export async function apiHealth(): Promise<{ status: string }> {
  return request("/health")
}