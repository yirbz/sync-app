import { Jellyfin, Api } from "@jellyfin/sdk"
import { getUserApi, getSystemApi } from "@jellyfin/sdk/lib/utils/api"

const CLIENT_INFO = { name: "Sync", version: "1.0.0" }
const DEVICE_INFO = { id: "sync-web-" + Math.random().toString(36).slice(2, 8), name: "Sync Web" }

let jellyfinInstance: Jellyfin | null = null
let apiInstance: Api | null = null
let currentUser: { id: string; name: string } | null = null

function getJellyfin(): Jellyfin {
  if (!jellyfinInstance) {
    jellyfinInstance = new Jellyfin({ clientInfo: CLIENT_INFO, deviceInfo: DEVICE_INFO })
  }
  return jellyfinInstance
}

export function createApi(serverUrl: string, token?: string): Api {
  const jf = getJellyfin()
  const api = jf.createApi(serverUrl, token || "")
  apiInstance = api
  return api
}

export function getApi(): Api | null {
  return apiInstance
}

export function getItemImageUrl(itemId: string, tag?: string): string {
  if (!apiInstance || !tag) return ""
  return `${apiInstance.basePath}/Items/${itemId}/Images/Primary?tag=${tag}&quality=90`
}

export async function login(serverUrl: string, username: string, password: string) {
  const api = createApi(serverUrl)
  const userApi = getUserApi(api)
  const auth = await userApi.authenticateUserByName({
    authenticateUserByName: { Username: username, Pw: password },
  })
  const token = auth.data.AccessToken || ""
  api.accessToken = token
  apiInstance = api

  const userId = auth.data.User?.Id || ""
  const userName = auth.data.User?.Name || username
  currentUser = { id: userId, name: userName }

  const serverInfo = await getSystemApi(api).getPublicSystemInfo()

  persistSession({ serverUrl, token, userId, userName, serverName: serverInfo.data.ServerName || "" })

  return {
    token,
    user: { id: userId, name: userName },
    serverName: serverInfo.data.ServerName || "",
  }
}

export function logout() {
  apiInstance = null
  currentUser = null
  if (typeof window !== "undefined") {
    localStorage.removeItem("sync_session")
  }
}

export function getCurrentUser() {
  return currentUser
}

export interface SessionData {
  serverUrl: string
  token: string
  userId: string
  userName: string
  serverName: string
}

function persistSession(data: SessionData) {
  if (typeof window !== "undefined") {
    localStorage.setItem("sync_session", JSON.stringify(data))
  }
}

export function restoreSession(): SessionData | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("sync_session")
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as SessionData
    const api = createApi(data.serverUrl, data.token)
    apiInstance = api
    currentUser = { id: data.userId, name: data.userName }
    return data
  } catch {
    localStorage.removeItem("sync_session")
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!apiInstance?.accessToken
}