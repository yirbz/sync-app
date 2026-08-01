/**
 * Helper utilities for Google Drive video integration in Sync App
 */

export function extractDriveFileId(input: string): string | null {
  if (!input) return null
  const trimmed = input.trim()

  // 1. /file/d/ID/view or /file/d/ID
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/)
  if (matchFileD) return matchFileD[1]

  // 2. ?id=ID or &id=ID (uc?id=... or open?id=...)
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/)
  if (matchIdParam) return matchIdParam[1]

  // 3. /d/ID
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/)
  if (matchD) return matchD[1]

  // 4. Raw file ID (usually ~15-60 characters alphanumeric)
  if (/^[a-zA-Z0-9_-]{15,60}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

export function getDriveDirectStreamUrl(fileIdOrUrl: string): string {
  const fileId = extractDriveFileId(fileIdOrUrl) || fileIdOrUrl
  const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://100.118.145.25:3001/api"
  return `${apiUrl}/web/stream?url=${encodeURIComponent(directUrl)}`
}

export function getDrivePreviewIframeUrl(fileIdOrUrl: string): string {
  const fileId = extractDriveFileId(fileIdOrUrl) || fileIdOrUrl
  return `https://drive.google.com/file/d/${fileId}/preview`
}

export function isDriveUrl(input: string): boolean {
  if (!input) return false
  return input.includes("drive.google.com") || extractDriveFileId(input) !== null
}
