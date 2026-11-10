import { NextRequest, NextResponse } from "next/server";

type SearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    channelId?: string;
    thumbnails?: { medium?: { url?: string }; high?: { url?: string }; default?: { url?: string } };
    publishedAt?: string;
  };
};
type VideoDetails = { id?: string; status?: { embeddable?: boolean; privacyStatus?: string } };
const jsonError = (message: string, status: number) => NextResponse.json({ error: message }, { status });

function normalize(value: string) {
  return value.toLocaleLowerCase().normalize("NFKC").replace(/[ً-ْـ]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function episodeMatch(text: string, season: number, episode: number) {
  const value = normalize(text);
  const e = String(episode).padStart(2, "0");
  const s = String(season).padStart(2, "0");
  const patterns = [
    new RegExp(`\\b(?:s\\s*0?${season})\\s*e\\s*0?${episode}\\b`, "i"),
    new RegExp(`\\b(?:episode|ep)\\s*0?${episode}\\b`, "i"),
    new RegExp(`الحلقة\\s*0?${episode}(?:\\s|$)`, "i"),
    new RegExp(`(?:الموسم|season)\\s*0?${season}.*(?:الحلقة|episode)\\s*0?${episode}`, "i"),
  ];
  return patterns.some((pattern) => pattern.test(value)) || value.includes(`s${s}e${e}`);
}
function relevance(item: SearchItem, titles: string[], type: string, season: number, episode: number) {
  const text = normalize(`${item.snippet?.title || ""} ${item.snippet?.description || ""}`);
  const titleScore = titles.reduce((best, title) => {
    const normalized = normalize(title);
    if (!normalized) return best;
    const words = normalized.split(" ").filter((word) => word.length > 1);
    const matched = words.filter((word) => text.includes(word)).length;
    return Math.max(best, matched / Math.max(words.length, 1));
  }, 0);
  const episodeScore = type === "series" && episodeMatch(text, season, episode) ? 100 : 0;
  return episodeScore + titleScore * 20;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const titleEn = (params.get("title") || "").trim();
  const titleAr = (params.get("titleAr") || "").trim();
  const type = params.get("type") === "series" ? "series" : "movie";
  const season = Math.max(1, Number(params.get("season")) || 1);
  const episode = Math.max(1, Number(params.get("episode")) || 1);
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) return jsonError("The alternative source is temporarily unavailable.", 503);
  if (!titleEn && !titleAr) return jsonError("A title is required to search YouTube.", 400);

  const se = `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
  // Search both original and localized titles regardless of the current UI language.
  // This fixes English mode missing Arabic-only Lebanese/Syrian uploads.
  const queries = type === "series"
    ? [
        titleAr && `${titleAr} الحلقة ${episode}`,
        titleEn && `${titleEn} episode ${episode}`,
        titleEn && `${titleEn} ${se}`,
        titleAr && `${titleAr} ${se}`,
        titleAr,
        titleEn,
      ]
    : [
        titleAr && `${titleAr} فيلم كامل`,
        titleEn && `${titleEn} full movie`,
        titleAr,
        titleEn,
      ];
  const uniqueQueries = [...new Set(queries.filter((q): q is string => Boolean(q?.trim())))];
  const base = "https://www.googleapis.com/youtube/v3";
  const allItems = new Map<string, SearchItem>();

  try {
    for (const q of uniqueQueries) {
      const url = new URL(`${base}/search`);
      url.search = new URLSearchParams({
        part: "snippet", q: q.slice(0, 160), type: "video", maxResults: "10",
        order: "relevance", safeSearch: "moderate", key: apiKey,
      }).toString();
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return jsonError("YouTube fallback is temporarily unavailable. Please try again later.", response.status === 403 ? 503 : 502);
      const data = await response.json() as { items?: SearchItem[] };
      for (const item of data.items || []) {
        const id = item.id?.videoId;
        if (id && item.snippet) allItems.set(id, item);
      }
    }

    const candidates = [...allItems.entries()]
      .sort((a, b) => relevance(b[1], [titleAr, titleEn], type, season, episode) - relevance(a[1], [titleAr, titleEn], type, season, episode))
      .slice(0, 50);
    if (!candidates.length) return NextResponse.json({ items: [] });

    const detailsUrl = new URL(`${base}/videos`);
    detailsUrl.search = new URLSearchParams({ part: "status", id: candidates.map(([id]) => id).join(","), key: apiKey }).toString();
    const detailsResponse = await fetch(detailsUrl, { cache: "no-store" });
    if (!detailsResponse.ok) return jsonError("YouTube fallback is temporarily unavailable. Please try again later.", detailsResponse.status === 403 ? 503 : 502);
    const detailsData = await detailsResponse.json() as { items?: VideoDetails[] };
    const embeddable = new Set((detailsData.items || [])
      .filter((v) => v.status?.embeddable === true && v.status?.privacyStatus === "public")
      .map((v) => v.id).filter((id): id is string => Boolean(id)));
    const allowedChannels = (process.env.YOUTUBE_ALLOWED_CHANNEL_IDS || "").split(",").map((id) => id.trim()).filter(Boolean);

    // Return the best matching embeddable result only: the player opens the
    // requested episode directly instead of presenting a separate result catalogue.
    const best = candidates.find(([videoId, item]) => embeddable.has(videoId) &&
      (!allowedChannels.length || allowedChannels.includes(item.snippet?.channelId || "")));
    if (!best) return NextResponse.json({ items: [] });
    const [videoId, item] = best;
    const snippet = item.snippet!;
    return NextResponse.json({ items: [{
      videoId,
      title: snippet.title || "YouTube video",
      description: snippet.description || "",
      channelTitle: snippet.channelTitle || "YouTube channel",
      channelId: snippet.channelId || "",
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      publishedAt: snippet.publishedAt || "",
    }] });
  } catch {
    return jsonError("Could not contact YouTube. Please try again.", 502);
  }
}
