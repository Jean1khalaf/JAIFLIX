"use client";

import { useEffect, useState } from "react";

type Video = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
  publishedAt: string;
};

type Props = {
  vidApiSrc: string;
  title: string;
  titleAr: string;
  type: "movie" | "series";
  season: number;
  episode: number;
  lang: "en" | "ar";
};

export default function PlaybackSwitcher({ vidApiSrc, title, titleAr, type, season, episode, lang }: Props) {
  const [source, setSource] = useState<"vidapi" | "youtube">("vidapi");
  const [videos, setVideos] = useState<Video[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false);
  const ar = lang === "ar";

  // VidAPI is always the first source. Since its player is cross-origin, the
  // browser cannot reliably inspect an internal 404; offer a recovery option
  // after a short wait without incorrectly claiming that playback failed.
  useEffect(() => {
    if (source !== "vidapi") {
      setShowFallbackPrompt(false);
      return;
    }
    const timer = window.setTimeout(() => setShowFallbackPrompt(true), 12000);
    return () => window.clearTimeout(timer);
  }, [source, vidApiSrc]);

  async function openYouTubeFallback(force = false) {
    setSource("youtube");
    if ((searched && !force) || loading) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ title, titleAr, type, season: String(season), episode: String(episode), lang });
      const response = await fetch(`/api/youtube?${query.toString()}`);
      const data = await response.json() as { items?: Video[]; error?: string };
      if (!response.ok) throw new Error(ar ? "خدمة YouTube الاحتياطية غير متاحة حالياً. حاول مرة أخرى لاحقاً." : "The YouTube backup is temporarily unavailable. Please try again later.");
      setVideos(data.items || []);
      if (!data.items?.length) setError(ar ? "لم نعثر على فيديوهات قابلة للتضمين لهذا العنوان." : "No embeddable YouTube videos were found for this title.");
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "YouTube search failed.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="playbackBox" dir={ar ? "rtl" : "ltr"}>
      {source === "vidapi" ? (
        <>
          <iframe className="player" src={vidApiSrc} title={`${title} — VidAPI`} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="origin" />
          <p className="playerHint">{ar ? "المشغل الأساسي قيد التشغيل. إذا لم يبدأ الفيديو، يمكنك تجربة مصدر بديل." : "Your primary player is loading. If the video does not start, you can try an alternative source."}</p>
          {showFallbackPrompt && <div className="notice fallbackPrompt" role="status">{ar ? "هل تواجه مشكلة في التشغيل؟ يمكنك تجربة مصدر YouTube الاحتياطي." : "Having trouble playing this video? You can try the YouTube backup."}</div>}
          <button className="btn dark fallbackCta" type="button" onClick={() => { void openYouTubeFallback(); }}>{ar ? "▶ جرّب مصدراً بديلاً" : "▶ Try another source"}</button>
        </>
      ) : (
        <>
          <button className="btn dark" type="button" onClick={() => { setSource("vidapi"); setSelected(""); }}>{ar ? "العودة إلى المشغل الأساسي" : "Back to primary player"}</button>
          {selected ? (
            <>
              <iframe className="player" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selected)}?autoplay=0&rel=0`} title={`${title} — YouTube`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              <button className="btn dark" type="button" onClick={() => setSelected("")}>{ar ? "العودة إلى نتائج YouTube" : "Back to YouTube results"}</button>
            </>
          ) : (
            <div className="youtubePanel">
              <div className="youtubePanelHead">
                <h2>{ar ? "نتائج YouTube" : "YouTube results"}</h2>
                <p>{ar ? "اختر فيديو متاحاً للتضمين. تحقق من أن القناة تملك حقوق نشر المحتوى." : "Choose an embeddable video. Make sure the channel is authorized to publish the content."}</p>
              </div>
              {loading && <p className="playerHint">{ar ? "جارٍ البحث في YouTube…" : "Searching YouTube…"}</p>}
              {error && <div className="notice" role="status">{error}</div>}
              {videos.length > 0 && <div className="youtubeResults">{videos.map((video) => (
                <button className="youtubeResult" key={video.videoId} type="button" onClick={() => setSelected(video.videoId)}>
                  <img src={video.thumbnail} alt="" loading="lazy" />
                  <span className="youtubeResultText"><strong>{video.title}</strong><small>{video.channelTitle}</small></span>
                  <span className="youtubePlay" aria-hidden="true">▶</span>
                </button>
              ))}</div>}
              {searched && videos.length > 0 && <button className="btn dark" type="button" onClick={() => { setSearched(false); setVideos([]); void openYouTubeFallback(true); }}>{ar ? "إعادة البحث" : "Search again"}</button>}
              <p className="playerHint">{ar ? "قد لا تكون كل نتائج البحث مرخّصة أو متاحة في بلدك. JAIFLIX لا يستضيف هذه الفيديوهات." : "Search results are not guaranteed to be licensed or available in your region. JAIFLIX does not host these videos."}</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
