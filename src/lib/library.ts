import { getItemsApi, getLibraryApi, getUserViewsApi } from "@jellyfin/sdk/lib/utils/api"
import { getApi } from "./jellyfin"

export interface LibraryItem {
  id: string
  name: string
  type: string
  year?: number
  runtime?: number
  imageTags?: Record<string, string>
  backdropTags?: string[]
  mediaType?: string
}

export interface LibraryFolder {
  id: string
  name: string
  collectionType: string
  itemCount?: number
  imageTags?: Record<string, string>
}

export async function getLibraries(): Promise<LibraryFolder[]> {
  const api = getApi()
  if (!api) return []

  const userId = getUserId()
  const viewsApi = getUserViewsApi(api)
  const resp = await viewsApi.getUserViews({ userId })
  return (resp.data.Items || []).map((lib: any) => ({
    id: lib.Id || "",
    name: lib.Name || "",
    collectionType: lib.CollectionType || "",
    itemCount: lib.ChildCount,
    imageTags: lib.ImageTags,
  }))
}

export async function getItems(libraryId?: string, options?: {
  type?: string
  limit?: number
  startIndex?: number
  sortBy?: string
  sortOrder?: string
  searchTerm?: string
}): Promise<{ items: LibraryItem[]; total: number }> {
  const api = getApi()
  if (!api) return { items: [], total: 0 }

  const itemsApi = getItemsApi(api)
  const userId = getUserId()

  const params: any = {
    userId,
    limit: options?.limit || 50,
    startIndex: options?.startIndex || 0,
    recursive: true,
    enableImageTypes: ["Primary", "Backdrop", "Thumb"],
    fields: ["PrimaryImageAspectRatio", "BasicSyncInfo"],
  }

  if (options?.type && options.type !== "all") {
    params.includeItemTypes = [options.type]
  }
  if (libraryId) {
    params.parentId = libraryId
  }
  if (options?.sortBy) {
    params.sortBy = [options.sortBy]
  }
  if (options?.sortOrder) {
    params.sortOrder = [options.sortOrder]
  }
  if (options?.searchTerm) {
    params.searchTerm = options.searchTerm
  }

  const resp = await itemsApi.getItems(params)
  return {
    items: (resp.data.Items || []).map((item: any) => ({
      id: item.Id || "",
      name: item.Name || "",
      type: item.Type || "",
      year: item.ProductionYear,
      runtime: item.RunTimeTicks ? Math.floor(item.RunTimeTicks / 10000) : undefined,
      imageTags: item.ImageTags,
      backdropTags: item.BackdropImageTags,
      mediaType: item.MediaType,
    })),
    total: resp.data.TotalRecordCount || 0,
  }
}

function getUserId(): string {
  if (typeof window === "undefined") return ""
  try {
    const session = JSON.parse(localStorage.getItem("sync_session") || "{}")
    return session.userId || ""
  } catch {
    return ""
  }
}