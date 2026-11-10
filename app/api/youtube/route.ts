import { NextRequest, NextResponse } from "next/server";

type YouTubeSearchItem = {
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

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = (params.get("title") || "").trim();
  const titleAr = (params.get("titleAr") || "").trim();
  const type = params.get("type") === "series" ? "series" : "movie";
  const season = Math.max(1, Number(params.get("season")) || 1);
  const episode = Math.max(1, Number(params.get("episode")) || 1);
  const lang = params.get("lang") === "ar" ? "ar" : "en";
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({ error: "The alternative source is temporarily unavailable." }, { status: 503 });
  }
  if (!title && !titleAr) {
    return NextResponse.json({ error: "A title is required to search YouTube." }, { status: 400 });
  }

  const episodeTerms = type === "series"
    ? ` season ${season} episode ${episode} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")} الحلقة ${episode} الموسم ${season}`
    : " full movie فيلم كامل";
  const terms = [titleAr, title].filter(Boolean);
  const query = `${terms.join(" ")} ${episodeTerms}`.trim().slice(0, 180);
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.search = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "10",
    order: "relevance",
    safeSearch: "moderate",
    videoEmbeddable: "true",
    ...(lang === "ar" ? { relevanceLanguage: "ar", regionCode: "LB" } : { relevanceLanguage: "en" }),
    key: apiKey,
  }).toString();

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    const data = await response.json() as { error?: { message?: string }; items?: YouTubeSearchItem[] };
    if (!response.ok) {
      // Never return provider diagnostics to the browser. The API key remains
      // server-side and provider errors are intentionally presented generically.
      const status = response.status === 403 ? 503 : 502;
      return NextResponse.json(
        { error: "YouTube fallback is temporarily unavailable. Please try again later." },
        { status },
      );
    }

    const allowedChannels = (process.env.YOUTUBE_ALLOWED_CHANNEL_IDS || "")
      .split(",").map((id) => id.trim()).filter(Boolean);
    const items = (data.items || []).flatMap((item) => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet;
      if (!videoId || !snippet) return [];
      if (allowedChannels.length && !allowedChannels.includes(snippet.channelId || "")) return [];
      return [{
        videoId,
        title: snippet.title || "YouTube video",
        description: snippet.description || "",
        channelTitle: snippet.channelTitle || "YouTube channel",
        channelId: snippet.channelId || "",
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        publishedAt: snippet.publishedAt || "",
      }];
    });

    return NextResponse.json({ items, filteredByAllowedChannels: allowedChannels.length > 0 });
  } catch {
    return NextResponse.json({ error: "Could not contact YouTube. Please try again." }, { status: 502 });
  }
}
