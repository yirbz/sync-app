import { createSyncPlayGroup, joinSyncPlayGroup, leaveSyncPlayGroup, setSyncPlayQueue } from "./syncplay"
import {
  apiGetRooms,
  apiCreateRoom,
  apiGetRoomByInviteCode,
  apiJoinRoom,
  apiLeaveRoom,
  apiGetRoom,
  apiUpdateRoom,
} from "./api"

export interface Room {
  id: string
  name: string
  syncPlayGroupId: string
  itemIds: string[]
  createdBy: string
  createdAt: number
  inviteCode: string
  status: "idle" | "playing" | "paused"
  participantCount: number
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

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function dtoToRoom(dto: any): Room {
  return {
    id: dto.id,
    name: dto.name,
    syncPlayGroupId: dto.syncplayGroupId,
    itemIds: dto.itemIds || [],
    createdBy: dto.createdBy,
    createdAt: new Date(dto.createdAt).getTime(),
    inviteCode: dto.inviteCode,
    status: dto.status || "idle",
    participantCount: dto.participantCount || 0,
  }
}

export async function createRoom(name: string, itemIds: string[], createdBy: string): Promise<Room> {
  const syncPlayGroupId = await createSyncPlayGroup(name)
  if (itemIds.length > 0) {
    await setSyncPlayQueue(itemIds)
  }

  try {
    const dto = await apiCreateRoom({ name, syncplayGroupId: syncPlayGroupId, itemIds })
    return dtoToRoom(dto)
  } catch {
    const room: Room = {
      id: crypto.randomUUID(),
      name,
      syncPlayGroupId,
      itemIds,
      createdBy,
      createdAt: Date.now(),
      inviteCode: generateInviteCode(),
      status: "idle",
      participantCount: 1,
    }
    const rooms = getLocalRooms()
    rooms.unshift(room)
    saveLocalRooms(rooms)
    return room
  }
}

export async function joinRoomByInviteCode(inviteCode: string): Promise<Room | null> {
  try {
    const dto = await apiGetRoomByInviteCode(inviteCode)
    await joinSyncPlayGroup(dto.syncplayGroupId)
    await apiJoinRoom(dto.id)
    return dtoToRoom(dto)
  } catch {
    const rooms = getLocalRooms()
    const room = rooms.find((r) => r.inviteCode === inviteCode)
    if (!room) return null
    await joinSyncPlayGroup(room.syncPlayGroupId)
    room.participantCount += 1
    saveLocalRooms(rooms)
    return room
  }
}

export async function leaveRoom(roomId: string) {
  try {
    await apiLeaveRoom(roomId)
  } catch {
    /* fallback */
  }
  await leaveSyncPlayGroup()
  const rooms = getLocalRooms()
  const idx = rooms.findIndex((r) => r.id === roomId)
  if (idx !== -1) {
    rooms.splice(idx, 1)
    saveLocalRooms(rooms)
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

export function getRoomByInviteCode(code: string): Room | undefined {
  return getLocalRooms().find((r) => r.inviteCode === code)
}

export function getRoomBySyncPlayGroupId(groupId: string): Room | undefined {
  return getLocalRooms().find((r) => r.syncPlayGroupId === groupId)
}

export function getInviteLink(room: Room): string {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}/rooms/join?code=${room.inviteCode}`
}

export async function syncRoomsWithServer(): Promise<void> {
  try {
    await apiGetRooms()
  } catch {
    /* server not available */
  }
}

export async function updateRoomStatus(roomId: string, status: string) {
  try {
    await apiUpdateRoom(roomId, { status })
  } catch {
    /* fallback */
  }
  const rooms = getLocalRooms()
  const room = rooms.find((r) => r.id === roomId)
  if (room) {
    room.status = status as Room["status"]
    saveLocalRooms(rooms)
  }
}