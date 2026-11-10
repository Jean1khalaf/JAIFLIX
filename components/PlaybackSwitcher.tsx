"use client";

import { useState } from "react";

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
  const ar = lang === "ar";

  async function openYouTubeFallback(force = false) {
    setSource("youtube");
    if ((searched && !force) || loading) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ title, titleAr, type, season: String(season), episode: String(episode), lang });
      const response = await fetch(`/api/youtube?${query.toString()}`);
      const data = await response.json() as { items?: Video[]; error?: string };
      if (!response.ok) throw new Error(data.error || "YouTube search failed.");
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
      <div className="sourceBar">
        <button className={`sourceButton ${source === "vidapi" ? "selected" : ""}`} onClick={() => setSource("vidapi")} type="button">VidAPI · {ar ? "المصدر الأساسي" : "Primary"}</button>
        <button className={`sourceButton ${source === "youtube" ? "selected" : ""}`} onClick={openYouTubeFallback} type="button">YouTube · {ar ? "مصدر احتياطي" : "Backup"}</button>
      </div>

      {source === "vidapi" ? (
        <>
          <iframe className="player" src={vidApiSrc} title={`${title} — VidAPI`} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="origin" />
          <p className="playerHint">{ar ? "إذا ظهر خطأ 404 أو تعذّر تشغيل الفيديو، جرّب مصدر YouTube الاحتياطي." : "If VidAPI shows a 404 or the video cannot play, switch to the YouTube backup."}</p>
          <button className="btn dark fallbackCta" type="button" onClick={openYouTubeFallback}>{ar ? "▶ جرّب YouTube بدلاً من ذلك" : "▶ Try YouTube instead"}</button>
        </>
      ) : (
        <>
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
