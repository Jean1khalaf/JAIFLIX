"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Video = { videoId: string; title: string; channelTitle: string };
type Props = {
  vidApiSrc: string; vidApiBase: string; tmdbId: number; title: string; titleAr: string;
  type: "movie" | "series"; seasons: number; season: number; episode: number; lang: "en" | "ar";
};

export default function PlaybackSwitcher({
  vidApiSrc, vidApiBase, tmdbId, title, titleAr, type, seasons,
  season: initialSeason, episode: initialEpisode, lang,
}: Props) {
  const router = useRouter();
  const [source, setSource] = useState<"vidapi" | "youtube">("vidapi");
  const [activeSeason, setActiveSeason] = useState(initialSeason);
  const [activeEpisode, setActiveEpisode] = useState(initialEpisode);
  const [activeVidApiSrc, setActiveVidApiSrc] = useState(vidApiSrc);
  const [selected, setSelected] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFallbackPrompt, setShowFallbackPrompt] = useState(false);
  const ar = lang === "ar";

  useEffect(() => { setActiveSeason(initialSeason); setActiveEpisode(initialEpisode); }, [initialSeason, initialEpisode]);
  useEffect(() => {
    if (source !== "vidapi") { setShowFallbackPrompt(false); return; }
    const timer = window.setTimeout(() => setShowFallbackPrompt(true), 12000);
    return () => window.clearTimeout(timer);
  }, [source, activeVidApiSrc]);

  const playerUrl = useMemo(() => {
    const path = type === "movie" ? `/embed/movie/${tmdbId}` : `/embed/tv/${tmdbId}/${activeSeason}/${activeEpisode}`;
    const query = new URLSearchParams({ primaryColor: "#e50914", ds_lang: lang, title, autoplay: "1" });
    return `${vidApiBase.replace(/\/$/, "")}${path}?${query.toString()}`;
  }, [vidApiBase, tmdbId, type, activeSeason, activeEpisode, lang, title]);

  async function loadYouTube(targetSeason = activeSeason, targetEpisode = activeEpisode) {
    if (loading) return;
    setSource("youtube"); setSelected(null); setLoading(true); setError("");
    try {
      const query = new URLSearchParams({ title, titleAr, type, season: String(targetSeason), episode: String(targetEpisode), lang });
      const response = await fetch(`/api/youtube?${query.toString()}`);
      const data = await response.json() as { items?: Video[]; error?: string };
      if (!response.ok) {
        const safeMessage = data.error || (ar
          ? "مصدر YouTube غير متاح حالياً. حاول مرة أخرى لاحقاً."
          : "The YouTube source is temporarily unavailable. Please try again later.");
        throw new Error(ar
          ? "تعذّر تشغيل المصدر الاحتياطي. تحقق من إعدادات YouTube API في الخادم ثم حاول مجدداً."
          : safeMessage);
      }
      const best = data.items?.[0];
      if (!best) setError(ar ? "لم نعثر على نسخة قابلة للتضمين من هذه الحلقة. قد يكون التضمين معطلاً من صاحب القناة." : "We couldn't find an embeddable copy of this episode. The channel may have disabled embedding.");
      else setSelected(best);
    } catch (e) {
      setError(e instanceof Error ? e.message : (ar ? "تعذّر البحث في YouTube." : "YouTube search failed."));
    } finally { setLoading(false); }
  }

  function updateEpisode() {
    const nextSeason = Math.max(1, activeSeason), nextEpisode = Math.max(1, activeEpisode);
    const params = new URLSearchParams({ lang, type, season: String(nextSeason), episode: String(nextEpisode) });
    router.replace(`/watch/${tmdbId}?${params.toString()}`, { scroll: false });
    setActiveVidApiSrc(playerUrl); setError(""); setSelected(null);
    if (source === "youtube") void loadYouTube(nextSeason, nextEpisode);
  }

  function switchToVidApi() { setSource("vidapi"); setSelected(null); setError(""); setActiveVidApiSrc(playerUrl); }

  return <section className="playbackBox" dir={ar ? "rtl" : "ltr"}>
    {type === "series" && <div className="watchControls">
      <label>{ar ? "الموسم" : "Season"}<select value={activeSeason} onChange={event => { setActiveSeason(Number(event.target.value)); setActiveEpisode(1); }}>
        {Array.from({ length: Math.max(1, seasons) }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
      </select></label>
      <label>{ar ? "الحلقة" : "Episode"}<input type="number" min={1} value={activeEpisode} onChange={event => setActiveEpisode(Math.max(1, Number(event.target.value) || 1))} onKeyDown={event => { if (event.key === "Enter") updateEpisode(); }} /></label>
      <button className="btn red playEpisodeButton" type="button" onClick={updateEpisode}>{ar ? "▶ تشغيل الحلقة" : "▶ Play episode"}</button>
    </div>}

    <div className="watchSourceStatus"><span className={`sourceBadge ${source === "vidapi" ? "active" : ""}`}>VidAPI · {ar ? "أساسي" : "Primary"}</span>{source === "youtube" && <span className="sourceBadge active youtubeBadge">YouTube · {ar ? "احتياطي" : "Backup"}</span>}</div>

    {source === "vidapi" ? <>
      <iframe key={activeVidApiSrc} className="player" src={activeVidApiSrc} title={`${title} — VidAPI`} allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="origin" />
      <p className="playerHint">{ar ? "يعمل المشغل الأساسي. إذا لم يبدأ الفيديو، يمكنك تجربة YouTube." : "The primary player is active. If playback fails, you can try YouTube."}</p>
      {showFallbackPrompt && <div className="notice fallbackPrompt" role="status">{ar ? "هل تواجه مشكلة في التشغيل؟ جرّب المصدر الاحتياطي." : "Having trouble playing? Try the backup source."}</div>}
      <button className="btn dark fallbackCta" type="button" onClick={() => void loadYouTube()}>{ar ? "▶ شاهد عبر YouTube" : "▶ Watch on YouTube"}</button>
    </> : <>
      <div className="youtubeToolbar"><div><strong>{ar ? "تشغيل عبر YouTube" : "Playing via YouTube"}</strong><p>{ar ? "يمكنك تغيير الموسم أو الحلقة أعلاه دون مغادرة المشغل." : "Change the season or episode above without leaving the player."}</p></div><button className="btn dark" type="button" onClick={switchToVidApi}>{ar ? "العودة إلى VidAPI" : "Back to VidAPI"}</button></div>
      {loading && <div className="youtubePanel"><p className="playerHint">{ar ? "جارٍ العثور على الحلقة…" : "Finding your selected episode…"}</p></div>}
      {selected && <><div className="playerNowPlaying"><strong>{selected.title}</strong><span>{selected.channelTitle}</span></div><iframe key={selected.videoId} className="player" src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(selected.videoId)}?autoplay=1&rel=0`} title={`${title} — YouTube`} allow="autoplay; encrypted-media; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /></>}
      {error && <div className="youtubePanel"><div className="notice" role="status">{error}</div><button className="btn dark" type="button" onClick={() => void loadYouTube()}>{ar ? "حاول مرة أخرى" : "Try again"}</button></div>}
      {!loading && !selected && !error && <div className="youtubePanel"><p className="playerHint">{ar ? "اختر الحلقة ثم اضغط تشغيل الحلقة." : "Choose a season and episode, then press Play episode."}</p></div>}
    </>}
  </section>;
}
