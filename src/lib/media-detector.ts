/**
 * Smart media extractor: parses URLs to see if it's YouTube, Google Drive, direct MP4/HLS, or standard web stream.
 */
export function detectMediaFromUrl(rawUrl: string): { platform: string; contentId: string; title: string } | null {
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

  return {
    platform: "web",
    contentId: url,
    title: "Video Web",
  }
}
