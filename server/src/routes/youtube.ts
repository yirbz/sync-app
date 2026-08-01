import { Router } from "express";

export const youtubeRouter = Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const VIDEO_CATEGORIES: Record<string, string> = {
  music: "10",
  gaming: "20",
  entertainment: "24",
  news: "25",
  sports: "17",
  education: "27",
  comedy: "23",
};

function itemToVideo(item: any, idField = "id") {
  const id = typeof item[idField] === "object" ? item[idField]?.videoId : item[idField];
  const duration = parseISO8601Duration(item.contentDetails?.duration || "");
  return {
    id: id || "",
    title: item.snippet?.title || "",
    description: item.snippet?.description || "",
    channelTitle: item.snippet?.channelTitle || "",
    channelId: item.snippet?.channelId || "",
    thumbnails: item.snippet?.thumbnails || {},
    publishedAt: item.snippet?.publishedAt || "",
    duration,
  };
}

// GET /api/youtube/trending?regionCode=MX&maxResults=20&category=music
youtubeRouter.get("/trending", async (req, res) => {
  if (!YOUTUBE_API_KEY) {
    return res.status(501).json({ error: "YouTube API key no configurada (YOUTUBE_API_KEY)" });
  }

  const maxResults = Math.min(Number(req.query.maxResults) || 20, 50);
  const regionCode = (req.query.regionCode as string) || "MX";
  const category = (req.query.category as string) || "";

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("chart", "mostPopular");
    url.searchParams.set("regionCode", regionCode);
    url.searchParams.set("maxResults", String(maxResults));
    if (category && VIDEO_CATEGORIES[category]) {
      url.searchParams.set("videoCategoryId", VIDEO_CATEGORIES[category]);
    }
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      const err = await resp.text();
      return res.status(resp.status).json({ error: `YouTube API error: ${err}` });
    }

    const data = await resp.json();
    const items = (data.items || []).map((item: any) => itemToVideo(item, "id"));

    res.json({ items, nextPageToken: data.nextPageToken || null });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/youtube/search?q=...&maxResults=...
youtubeRouter.get("/search", async (req, res) => {
  if (!YOUTUBE_API_KEY) {
    return res.status(501).json({ error: "YouTube API key no configurada (YOUTUBE_API_KEY)" });
  }

  const q = req.query.q as string;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: "Parámetro q requerido" });
  }

  const maxResults = Math.min(Number(req.query.maxResults) || 15, 50);

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("maxResults", String(maxResults));
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const searchResp = await fetch(searchUrl.toString());
    if (!searchResp.ok) {
      const err = await searchResp.text();
      return res.status(searchResp.status).json({ error: `YouTube API error: ${err}` });
    }

    const searchData = await searchResp.json();
    const videoIds = (searchData.items || []).map((i: any) => i.id?.videoId).filter(Boolean);

    // Batch-fetch durations
    let durationMap: Record<string, number> = {};
    if (videoIds.length > 0) {
      const detailUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
      detailUrl.searchParams.set("part", "contentDetails");
      detailUrl.searchParams.set("id", videoIds.join(","));
      detailUrl.searchParams.set("key", YOUTUBE_API_KEY);
      const detailResp = await fetch(detailUrl.toString());
      if (detailResp.ok) {
        const detailData = await detailResp.json();
        for (const item of detailData.items || []) {
          durationMap[item.id] = parseISO8601Duration(item.contentDetails?.duration || "");
        }
      }
    }

    const items = (searchData.items || []).map((item: any) => {
      const videoId = item.id?.videoId || "";
      return {
        ...itemToVideo(item, "id"),
        id: videoId,
        duration: durationMap[videoId] || 0,
      };
    });

    res.json({ items, nextPageToken: searchData.nextPageToken || null });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/youtube/video?id=... — get video details
youtubeRouter.get("/video", async (req, res) => {
  if (!YOUTUBE_API_KEY) {
    return res.status(501).json({ error: "YouTube API key no configurada (YOUTUBE_API_KEY)" });
  }

  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "Parámetro id requerido" });

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("id", id);
    url.searchParams.set("key", YOUTUBE_API_KEY);

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      const err = await resp.text();
      return res.status(resp.status).json({ error: `YouTube API error: ${err}` });
    }

    const data = await resp.json();
    const item = data.items?.[0];
    if (!item) return res.status(404).json({ error: "Video no encontrado" });

    res.json(itemToVideo(item, "id"));
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1]?.replace("H", "") || "0");
  const minutes = parseInt(match[2]?.replace("M", "") || "0");
  const seconds = parseInt(match[3]?.replace("S", "") || "0");
  return hours * 3600 + minutes * 60 + seconds;
}
