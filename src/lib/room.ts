import {
  apiGetRooms,
  apiCreateRoom,
  apiGetRoomByInviteCode,
  apiJoinRoom,
  apiLeaveRoom,
  apiGetRoom,
  apiDeleteRoom,
  apiUpdateRoom,
  apiTransferControl,
  apiGetMessages,
  apiSendMessage,
  apiGetQueue,
  apiAddToQueue,
  apiRemoveFromQueue,
  apiUpdatePlayback,
} from "./api"
import type { ChatMessageDTO, QueueItemDTO, PlaybackStateDTO } from "./api"

export interface Room {
  id: string
  name: string
  syncPlayGroupId: string
  itemIds: string[]
  currentItem: { platform: string; id: string; title: string } | null
  createdBy: string
  createdByUserId: string
  controllerUserId: string
  createdAt: number
  inviteCode: string
  status: "idle" | "playing" | "paused"
  participantCount: number
  participants?: { id: string; userId: string; userName: string }[]
}

export interface QueueItem {
  id: string
  platform: string
  contentId: string
  title: string
  duration?: number
  imageUrl?: string
  addedBy: string
  addedAt: string
}

export interface PlaybackState {
  position: number
  isPlaying: boolean
  lastUpdated?: string
}

export interface ChatMessage {
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

const ROOMS_KEY = "sync_rooms"

function getLocalRooms(): Room[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(ROOMS_KEY) || "[]")
  } catch {
    return []
  }
}

function saveLocalRooms(rooms: Room[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
}

function dtoToRoom(dto: any): Room {
  let createdAtMs = Date.now()
  if (dto?.createdAt) {
    const parsed = new Date(dto.createdAt).getTime()
    if (!isNaN(parsed)) createdAtMs = parsed
  }

  return {
    id: dto.id,
    name: dto.name || "Sala de Cine",
    syncPlayGroupId: dto.syncplayGroupId || "",
    itemIds: dto.itemIds || [],
    currentItem: dto.currentItem || null,
    createdBy: dto.createdBy || "Usuario",
    createdByUserId: dto.createdByUserId || "",
    controllerUserId: dto.controllerUserId || dto.createdByUserId || "",
    createdAt: createdAtMs,
    inviteCode: dto.inviteCode || "",
    status: dto.status || "idle",
    participantCount: dto.participantCount || 0,
    participants: dto.participants || undefined,
  }
}

export async function createRoom(name: string, itemIds: string[]): Promise<Room> {
  const dto = await apiCreateRoom({ name, itemIds })
  return dtoToRoom(dto)
}

export async function joinRoomByInviteCode(inviteCode: string): Promise<Room | null> {
  try {
    const dto = await apiGetRoomByInviteCode(inviteCode)
    await apiJoinRoom(dto.id)
    return dtoToRoom(dto)
  } catch {
    const rooms = getLocalRooms()
    const room = rooms.find((r) => r.inviteCode === inviteCode)
    return room || null
  }
}

export async function leaveRoom(roomId: string) {
  try {
    await apiLeaveRoom(roomId)
  } catch {
    /* fallback */
  }
  const rooms = getLocalRooms()
  const idx = rooms.findIndex((r) => r.id === roomId)
  if (idx !== -1) {
    rooms.splice(idx, 1)
    saveLocalRooms(rooms)
  }
}

export async function deleteRoom(roomId: string): Promise<boolean> {
  try {
    await apiDeleteRoom(roomId)
  } catch {
    /* fallback */
  }
  const rooms = getLocalRooms()
  const idx = rooms.findIndex((r) => r.id === roomId)
  if (idx !== -1) {
    rooms.splice(idx, 1)
    saveLocalRooms(rooms)
  }
  return true
}

export async function updateRoomName(roomId: string, name: string): Promise<Room | null> {
  try {
    const dto = await apiUpdateRoom(roomId, { name })
    return dtoToRoom(dto)
  } catch {
    return null
  }
}

export async function getMyRooms(): Promise<Room[]> {
  try {
    const dtos = await apiGetRooms()
    return dtos.map(dtoToRoom)
  } catch {
    return getLocalRooms()
  }
}

export async function getRoomById(roomId: string): Promise<Room | undefined> {
  try {
    const dto = await apiGetRoom(roomId)
    return dtoToRoom(dto)
  } catch {
    return getLocalRooms().find((r) => r.id === roomId)
  }
}

export function getInviteLink(room: Room): string {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}/rooms/join?code=${room.inviteCode}`
}

export async function updateRoomContent(roomId: string, currentItem: { platform: string; id: string; title: string }) {
  try {
    await apiUpdateRoom(roomId, { currentItem, status: "idle" })
  } catch {
    /* fallback */
  }
}

export async function getRoomMessages(roomId: string): Promise<ChatMessage[]> {
  try {
    const dtos: ChatMessageDTO[] = await apiGetMessages(roomId)
    return dtos.map((d) => ({
      id: d.id,
      roomId: d.roomId,
      userId: d.userId,
      userName: d.userName,
      content: d.content,
      replyToId: d.replyToId,
      replyToUserName: d.replyToUserName,
      replyToContent: d.replyToContent,
      createdAt: d.createdAt,
    }))
  } catch {
    return []
  }
}

export async function sendRoomMessage(
  roomId: string,
  content: string,
  replyTo?: { id: string; userName: string; content: string }
): Promise<void> {
  try {
    await apiSendMessage(roomId, content, replyTo)
  } catch {
    /* fallback */
  }
}

export async function getQueue(roomId: string): Promise<{ queue: QueueItem[]; currentIndex: number; playbackState: PlaybackState; currentItem: any }> {
  const dto = await apiGetQueue(roomId)
  return {
    queue: (dto.queue || []).map((q: QueueItemDTO) => ({
      id: q.id,
      platform: q.platform,
      contentId: q.contentId,
      title: q.title,
      duration: q.duration,
      imageUrl: q.imageUrl,
      addedBy: q.addedBy,
      addedAt: q.addedAt,
    })),
    currentIndex: dto.currentIndex,
    playbackState: dto.playbackState,
    currentItem: dto.currentItem,
  }
}

export async function addToQueue(roomId: string, item: { platform: string; contentId: string; title: string; duration?: number; imageUrl?: string }): Promise<void> {
  try {
    await apiAddToQueue(roomId, item)
  } catch {
    /* fallback */
  }
}

export async function removeFromQueue(roomId: string, itemId: string): Promise<void> {
  try {
    await apiRemoveFromQueue(roomId, itemId)
  } catch {
    /* fallback */
  }
}

export async function updatePlayback(roomId: string, state: { position?: number; isPlaying?: boolean; currentIndex?: number }): Promise<void> {
  try {
    await apiUpdatePlayback(roomId, state)
  } catch {
    /* fallback */
  }
}

export async function transferControl(roomId: string, controllerUserId: string): Promise<void> {
  await apiTransferControl(roomId, controllerUserId)
}
