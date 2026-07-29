import { getSyncPlayApi } from "@jellyfin/sdk/lib/utils/api"
import { getApi } from "./jellyfin"

export interface SyncPlayGroup {
  groupId: string
  groupName: string
  itemId?: string
  participants: string[]
  lastActivityAt?: string
}

export async function createSyncPlayGroup(name: string): Promise<string> {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  const syncPlay = getSyncPlayApi(api)
  const resp = await syncPlay.syncPlayCreateGroup({
    newGroupRequestDto: { GroupName: name },
  })
  return resp.data.GroupId || ""
}

export async function joinSyncPlayGroup(groupId: string) {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  const syncPlay = getSyncPlayApi(api)
  await syncPlay.syncPlayJoinGroup({
    joinGroupRequestDto: { GroupId: groupId },
  })
}

export async function leaveSyncPlayGroup() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  const syncPlay = getSyncPlayApi(api)
  await syncPlay.syncPlayLeaveGroup()
}

export async function getSyncPlayGroups(): Promise<SyncPlayGroup[]> {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  const syncPlay = getSyncPlayApi(api)
  const resp = await syncPlay.syncPlayGetGroups()
  return (resp.data || []).map((g: any) => ({
    groupId: g.GroupId || "",
    groupName: g.GroupName || "",
    itemId: g.ItemId,
    participants: g.Participants || [],
    lastActivityAt: g.LastActivityAt,
  }))
}

export async function setSyncPlayQueue(itemIds: string[]) {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  const syncPlay = getSyncPlayApi(api)
  await syncPlay.syncPlaySetNewQueue({
    playRequestDto: {
      PlayingQueue: itemIds,
      StartPositionTicks: 0,
    },
  })
}

export async function syncPlaySetCurrentItem(itemId: string, positionTicks: number = 0) {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  const syncPlay = getSyncPlayApi(api)
  await syncPlay.syncPlaySetPlaylistItem({
    setPlaylistItemRequestDto: {
      PlaylistItemId: itemId,
    },
  })
  await syncPlay.syncPlayUnpause()
  if (positionTicks > 0) {
    await syncPlaySeek(positionTicks)
  }
}

export async function syncPlayPause() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayPause()
}

export async function syncPlayUnpause() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayUnpause()
}

export async function syncPlaySeek(positionTicks: number) {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlaySeek({
    seekRequestDto: { PositionTicks: positionTicks },
  })
}

export async function syncPlayStop() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayStop()
}

export async function syncPlayNext() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayNextItem({
    nextItemRequestDto: {},
  })
}

export async function syncPlayPrevious() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayPreviousItem({
    previousItemRequestDto: {},
  })
}

export async function syncPlayPing() {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayPing({
    pingRequestDto: { Ping: Date.now() },
  })
}

export async function syncPlayBuffering(positionTicks: number) {
  const api = getApi()
  if (!api) throw new Error("Not authenticated")
  await getSyncPlayApi(api).syncPlayBuffering({
    bufferRequestDto: {
      PositionTicks: positionTicks,
      IsPlaying: false,
    },
  })
}

export function getStreamUrl(itemId: string): string {
  const api = getApi()
  if (!api) return ""
  return `${api.basePath}/Videos/${itemId}/stream?static=true&api_key=${api.accessToken}`
}

export function getImageUrl(itemId: string, type: "Primary" | "Backdrop" | "Thumb" = "Primary", size?: number): string {
  const api = getApi()
  if (!api) return ""
  const tag = size ? `&maxWidth=${size}&maxHeight=${size}` : ""
  return `${api.basePath}/Items/${itemId}/Images/${type}?api_key=${api.accessToken}${tag}`
}