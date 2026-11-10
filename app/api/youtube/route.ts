import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type SearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    channelId?: string;
    thumbnails?: {
      medium?: { url?: string };
      high?: { url?: string };
      default?: { url?: string };
    };
    publishedAt?: string;
  };
};

type GoogleApiError = {
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{ reason?: string; message?: string }>;
  };
};

const safeError = (message: string, status: number, code: string) =>
  NextResponse.json({ error: message, code }, { status });

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[ً-ْـ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function scoreResult(
  item: SearchItem,
  titles: string[],
  type: "movie" | "series",
  season: number,
  episode: number,
) {
  const text = normalize(`${item.snippet?.title || ""} ${item.snippet?.description || ""}`);
  let score = 0;
  for (const candidate of titles) {
    const words = normalize(candidate).split(" ").filter((word) => word.length > 1);
    if (!words.length) continue;
    const matched = words.filter((word) => text.includes(word)).length;
    score = Math.max(score, (matched / words.length) * 20);
  }

  if (type === "series") {
    const ep = String(episode).padStart(2, "0");
    const se = String(season).padStart(2, "0");
    const patterns = [
      new RegExp(`\\b(?:s\\s*0?${season})\\s*e\\s*0?${episode}\\b`, "i"),
      new RegExp(`\\b(?:episode|ep)\\s*0?${episode}\\b`, "i"),
      new RegExp(`الحلقة\\s*0?${episode}`, "i"),
      new RegExp(`(?:الموسم|season)\\s*0?${season}.*(?:الحلقة|episode)\\s*0?${episode}`, "i"),
    ];
    if (patterns.some((pattern) => pattern.test(text)) || text.includes(`s${se}e${ep}`)) {
      score += 100;
    }
  }
  return score;
}

function getGoogleErrorReason(data: GoogleApiError) {
  return data.error?.errors?.[0]?.reason || "unknown";
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const titleEn = (params.get("title") || "").trim();
  const titleAr = (params.get("titleAr") || "").trim();
  const type = params.get("type") === "series" ? "series" : "movie";
  const season = Math.max(1, Number(params.get("season")) || 1);
  const episode = Math.max(1, Number(params.get("episode")) || 1);
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    console.error("[YouTube fallback] Missing YOUTUBE_API_KEY environment variable.");
    return safeError("YouTube fallback is not configured yet.", 503, "YOUTUBE_NOT_CONFIGURED");
  }
  if (!titleEn && !titleAr) {
    return safeError("A title is required to search YouTube.", 400, "TITLE_REQUIRED");
  }

  // Search Arabic uploads first for Arabic productions, regardless of the UI language.
  // A maximum of two search.list calls avoids burning the daily YouTube quota.
  const episodeText = `الحلقة ${episode}`;
  const seasonEpisode = `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
  const queries = type === "series"
    ? [
        titleAr ? `${titleAr} ${episodeText}` : `${titleEn} episode ${episode}`,
        titleEn ? `${titleEn} ${seasonEpisode}` : "",
      ]
    : [
        titleAr ? `${titleAr} فيلم كامل` : `${titleEn} full movie`,
        titleEn || titleAr,
      ];

  const base = "https://www.googleapis.com/youtube/v3";
  const allItems = new Map<string, SearchItem>();
  let lastReason = "unknown";

  try {
    for (const rawQuery of [...new Set(queries.map((q) => q.trim()).filter(Boolean))].slice(0, 2)) {
      const url = new URL(`${base}/search`);
      url.search = new URLSearchParams({
        part: "snippet",
        q: rawQuery.slice(0, 160),
        type: "video",
        maxResults: "15",
        order: "relevance",
        safeSearch: "moderate",
        videoEmbeddable: "true",
        key: apiKey,
      }).toString();

      const response = await fetch(url, { cache: "no-store" });
      const data = await response.json() as { items?: SearchItem[] } & GoogleApiError;

      if (!response.ok) {
        lastReason = getGoogleErrorReason(data);
        console.error("[YouTube fallback] Google API request failed:", {
          status: response.status,
          reason: lastReason,
          message: data.error?.message,
        });

        if (lastReason === "quotaExceeded" || lastReason === "dailyLimitExceeded" || lastReason === "rateLimitExceeded") {
          return safeError("YouTube's daily API quota has been reached. Please try again later.", 503, "YOUTUBE_QUOTA_EXCEEDED");
        }
        if (lastReason === "keyInvalid" || lastReason === "ipRefererBlocked" || lastReason === "accessNotConfigured") {
          return safeError("YouTube API configuration needs attention. Check the API key restrictions and enable YouTube Data API v3.", 503, "YOUTUBE_API_CONFIGURATION");
        }
        return safeError("YouTube could not complete the search. Please try again later.", 502, "YOUTUBE_API_ERROR");
      }

      for (const item of data.items || []) {
        const videoId = item.id?.videoId;
        if (videoId && item.snippet) allItems.set(videoId, item);
      }
      // If the first targeted search returned videos, don't spend quota on another search.
      if (allItems.size > 0) break;
    }

    if (!allItems.size) return NextResponse.json({ items: [] });

    const candidates = [...allItems.values()]
      .sort((a, b) =>
        scoreResult(b, [titleAr, titleEn], type, season, episode) -
        scoreResult(a, [titleAr, titleEn], type, season, episode),
      );

    // videoEmbeddable=true is a supported search.list filter. Search results are public
    // videos; this avoids a second videos.list call and its extra quota cost.
    const best = candidates[0];
    const videoId = best.id?.videoId;
    if (!videoId) return NextResponse.json({ items: [] });

    const snippet = best.snippet || {};
    return NextResponse.json({
      items: [{
        videoId,
        title: snippet.title || "YouTube video",
        description: snippet.description || "",
        channelTitle: snippet.channelTitle || "YouTube channel",
        channelId: snippet.channelId || "",
        thumbnail:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: snippet.publishedAt || "",
      }],
    });
  } catch (error) {
    console.error("[YouTube fallback] Unexpected error:", error);
    return safeError("Could not contact YouTube. Please try again.", 502, "YOUTUBE_NETWORK_ERROR");
  }
}
