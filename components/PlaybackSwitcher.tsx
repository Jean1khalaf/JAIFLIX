"use client";

import { useEffect, useState } from "react";

type Video = { videoId: string; title: string; channelTitle: string };
type Props = {
  vidApiSrc: string; title: string; titleAr: string; type: "movie" | "series";
  season: number; episode: number; lang: "en" | "ar";
};

export default function PlaybackSwitcher({ vidApiSrc, title, titleAr, type, season, episode, lang }: Props) {
  const [source, setSource] = useState<"vidapi" | "youtube">("vidapi");
  const [selected, setSelected] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false);
  const ar = lang === "ar";

  useEffect(() => {
    if (source !== "vidapi") { setShowFallbackPrompt(false); return; }
    const timer = window.setTimeout(() => setShowFallbackPrompt(true), 12000);
    return () => window.clearTimeout(timer);
  }, [source, vidApiSrc]);

  async function openYouTubeFallback() {
    if (loading) return;
    setSource("youtube");
    setSelected(null);
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ title, titleAr, type, season: String(season), episode: String(episode), lang });
      const response = await fetch(`/api/youtube?${query.toString()}`);
      const data = await response.json() as { items?: Video[] };
      if (!response.ok) throw new Error(ar ? "مصدر YouTube غير متاح حالياً. حاول مرة أخرى لاحقاً." : "The YouTube source is temporarily unavailable. Please try again later.");
      const best = data.items?.[0];
      if (!best) {
        setError(ar
          ? "لم نعثر على نسخة قابلة للتضمين من هذه الحلقة. قد تكون متاحة على YouTube لكن التضمين معطّل من صاحب القناة."
          : "We couldn't find an embeddable copy of this episode. It may be available on YouTube, but embedding may be disabled by its channel.");
      } else {
        setSelected(best);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : (ar ? "تعذّر البحث في YouTube." : "YouTube search failed."));
    } finally { setLoading(false); }
  }

  return (
    <section className="playbackBox" dir={ar ? "rtl" : "ltr"}>
      {source === "vidapi" ? <>
        <iframe className="player" src={vidApiSrc} title={`${title} — VidAPI`} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="origin" />
        <p className="playerHint">{ar ? "المشغل الأساسي قيد التشغيل. إذا لم يبدأ الفيديو، يمكنك تجربة مصدر بديل." : "Your primary player is loading. If the video does not start, you can try an alternative source."}</p>
        {showFallbackPrompt && <div className="notice fallbackPrompt" role="status">{ar ? "هل تواجه مشكلة في التشغيل؟ يمكنك تجربة مصدر YouTube الاحتياطي." : "Having trouble playing this video? You can try the YouTube backup."}</div>}
        <button className="btn dark fallbackCta" type="button" onClick={() => { void openYouTubeFallback(); }}>{ar ? "▶ شاهد عبر YouTube" : "▶ Watch on YouTube"}</button>
      </> : <>
        <button className="btn dark" type="button" onClick={() => { setSource("vidapi"); setSelected(null); setError(""); }}>{ar ? "العودة إلى المشغل الأساسي" : "Back to VidAPI"}</button>
        {loading && <div className="youtubePanel"><p className="playerHint">{ar ? "جارٍ العثور على الحلقة وتشغيلها…" : "Finding and starting your episode…"}</p></div>}
        {selected && <>
          <div className="playerNowPlaying"><strong>{selected.title}</strong><span>{selected.channelTitle}</span></div>
          <iframe className="player" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selected.videoId)}?autoplay=1&rel=0`} title={`${title} — YouTube`} allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        </>}
        {error && <div className="youtubePanel"><div className="notice" role="status">{error}</div><button className="btn dark" type="button" onClick={() => { void openYouTubeFallback(); }}>{ar ? "حاول مرة أخرى" : "Try again"}</button></div>}
        <p className="playerHint">{ar ? "يتم تشغيل الفيديو من YouTube مباشرةً. يجب أن يكون المحتوى متاحاً للتضمين ومصرحاً بنشره." : "Video playback is provided directly by YouTube. Videos must permit embedding and be authorized for publication."}</p>
      </>}
    </section>
  );
}
