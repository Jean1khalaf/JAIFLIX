import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "YouTube search is not configured." }, { status: 503 });
  }

  const params = request.nextUrl.searchParams;
  const title = (params.get("title") || "").trim().slice(0, 160);
  const country = (params.get("country") || "").toUpperCase();
  const season = Math.max(1, Math.min(99, Number(params.get("season") || 1)));
  const episode = Math.max(1, Math.min(999, Number(params.get("episode") || 1)));
  if (!title || !["TR", "LB"].includes(country)) {
    return NextResponse.json({ error: "A title and supported country (TR or LB) are required." }, { status: 400 });
  }

  // Search for a full episode, not a trailer or a short clip. YouTube's
  // videoEmbeddable filter prevents returning videos that cannot be embedded.
  const query = country === "TR"
    ? `${title} ${season}. sezon ${episode}. bölüm full bölüm`
    : `${title} الحلقة ${episode} مسلسل كامل`;
  const search = new URL("https://www.googleapis.com/youtube/v3/search");
  search.search = new URLSearchParams({
    key,
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "5",
    order: "relevance",
    videoEmbeddable: "true",
    safeSearch: "moderate",
    relevanceLanguage: country === "TR" ? "tr" : "ar",
  }).toString();

  try {
    const response = await fetch(search, { next: { revalidate: 900 } });
    const data = await response.json();
    if (!response.ok) {
      console.error("YouTube search API error:", data?.error?.message || response.statusText);
      return NextResponse.json({ error: "YouTube search failed." }, { status: 502 });
    }
    const videos = (data.items || [])
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet?.title || "YouTube episode",
      }));
    return NextResponse.json({ videos }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch {
    return NextResponse.json({ error: "Unable to contact YouTube." }, { status: 502 });
  }
}
