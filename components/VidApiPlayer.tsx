"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Season = { season_number: number; episode_count: number; name: string };
type Provider = { name: string; url: string; kind?: "youtube"; videoId?: string };
type YouTubeResult = { videoId: string; title: string };

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser required"));
  if (window.YT?.Player) return Promise.resolve();
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }
  return youtubeApiPromise;
}

function YouTubePlayer({ videoId, onPlaying, onError }: { videoId: string; onPlaying: () => void; onError: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const playingRef = useRef(onPlaying);
  const errorRef = useRef(onError);
  playingRef.current = onPlaying;
  errorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, enablejsapi: 1, origin: window.location.origin },
        events: {
          onStateChange: (event: any) => { if (event.data === 1) playingRef.current(); },
          onError: () => errorRef.current(),
        },
      });
    }).catch(() => errorRef.current());
    return () => {
      cancelled = true;
      try { playerRef.current?.destroy(); } catch { /* player may not have initialized */ }
      playerRef.current = null;
    };
  }, [videoId]);

  return <div className="vidapi-frame"><div ref={hostRef} style={{ width: "100%", height: "100%" }} /></div>;
}

function fillTemplate(template: string, values: { id: string; season: number; episode: number }) {
  return template
    .replaceAll("{id}", encodeURIComponent(values.id))
    .replaceAll("{season}", String(values.season))
    .replaceAll("{episode}", String(values.episode));
}

export default function VidApiPlayer({
  type,
  id,
  title,
  originalTitle,
  imdbId,
  seasons = [],
  lang = "en",
  originCountry = [],
}: {
  type: "movie" | "tv";
  id: string;
  title: string;
  originalTitle?: string;
  imdbId?: string;
  seasons?: Season[];
  lang?: "en" | "ar";
  originCountry?: string[];
}) {
  const available = seasons.filter((s) => s.season_number > 0 && s.episode_count > 0);
  const [season, setSeason] = useState(available[0]?.season_number ?? 1);
  const current = available.find((s) => s.season_number === season);
  const [episode, setEpisode] = useState(1);
  const [providerIndex, setProviderIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [youtubeResult, setYoutubeResult] = useState<YouTubeResult | null>(null);
  const [youtubeSearchDone, setYoutubeSearchDone] = useState(false);
  const [playbackStarted, setPlaybackStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const ar = lang === "ar";
  const youtubeCountry = originCountry.find((country) => country === "TR" || country === "LB") || "";
  const useYoutubeFallback = type === "tv" && Boolean(youtubeCountry);

  useEffect(() => {
    let cancelled = false;
    setYoutubeResult(null);
    setYoutubeSearchDone(!useYoutubeFallback);
    if (!useYoutubeFallback) return;
    const params = new URLSearchParams({ title: originalTitle || title, country: youtubeCountry, season: String(season), episode: String(episode) });
    fetch(`/api/youtube-search?${params.toString()}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("YouTube search unavailable")))
      .then((data) => { if (!cancelled) setYoutubeResult(data.videos?.[0] || null); })
      .catch(() => { if (!cancelled) setYoutubeResult(null); })
      .finally(() => { if (!cancelled) setYoutubeSearchDone(true); });
    return () => { cancelled = true; };
  }, [title, originalTitle, youtubeCountry, useYoutubeFallback, season, episode]);

  const providers = useMemo<Provider[]>(() => {
    const tmdbId = id;
    const primaryId = imdbId || id;
    const path = type === "movie"
      ? `/embed/movie/${encodeURIComponent(primaryId)}`
      : `/embed/tv/${encodeURIComponent(primaryId)}/${season}/${episode}`;
    const vidApiUrl = `https://vaplayer.ru${path}?primaryColor=%23e50914&lang=${lang}`;
    const vidukiTemplate = type === "movie"
      ? process.env.NEXT_PUBLIC_VIDUKI_MOVIE_URL_TEMPLATE
      : process.env.NEXT_PUBLIC_VIDUKI_TV_URL_TEMPLATE;
    const vidukiUrl = vidukiTemplate
      ? fillTemplate(vidukiTemplate, { id: tmdbId, season, episode })
      : "";
    const ezvidUrl = type === "movie"
      ? `https://ezvidapi.com/embed/movie/${encodeURIComponent(tmdbId)}`
      : `https://ezvidapi.com/embed/tv/${encodeURIComponent(tmdbId)}/${season}/${episode}`;
    const vidapiRuUrl = `https://vidapi.ru${path}?primaryColor=%23e50914&lang=${lang}`;
    return [
      { name: "VidAPI", url: vidApiUrl },
      ...(useYoutubeFallback && youtubeResult ? [{ name: "YouTube", url: `https://www.youtube.com/embed/${youtubeResult.videoId}`, kind: "youtube" as const, videoId: youtubeResult.videoId }] : []),
      ...(vidukiUrl ? [{ name: "Viduki", url: vidukiUrl }] : []),
      { name: "ezvidapi", url: ezvidUrl },
      { name: "vidapi.ru", url: vidapiRuUrl },
    ];
  }, [type, id, imdbId, season, episode, lang, useYoutubeFallback, youtubeResult]);

  useEffect(() => {
    setProviderIndex(0);
    setFailed(false);
    setPlaybackStarted(false);
  }, [type, id, season, episode]);

  const next = useCallback(() => {
    setPlaybackStarted(false);
    setSecondsLeft(15);
    setProviderIndex((index) => Math.min(index + 1, providers.length));
  }, [providers.length]);

  const active = providers[providerIndex];
  useEffect(() => {
    if (providerIndex >= providers.length) setFailed(true);
    else setFailed(false);
  }, [providerIndex, providers.length]);

  // YouTube playback start is detected through its official IFrame API. Other
  // third-party iframes are cross-origin and may not expose a playback signal;
  // their 15-second watchdog is therefore best-effort, not proof of failure.
  useEffect(() => {
    if (!active || playbackStarted) return;
    if (active.name === "VidAPI" && useYoutubeFallback && !youtubeSearchDone) return;
    setSecondsLeft(15);
    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      const remaining = Math.max(0, 15 - Math.floor((Date.now() - startedAt) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(tick);
        next();
      }
    }, 250);
    return () => window.clearInterval(tick);
  }, [active?.name, active?.url, playbackStarted, next, useYoutubeFallback, youtubeSearchDone]);

  // Viduki exposes a specific message when all of its internal servers fail.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.viduki.net") return;
      if (event.data?.type === "viduki:all-servers-failed") next();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [next]);

  const markStarted = useCallback(() => setPlaybackStarted(true), []);

  return (
    <section className="vidapi-player" dir={ar ? "rtl" : "ltr"}>
      {type === "tv" && (
        <div className="episode-controls">
          <label>
            {ar ? "الموسم" : "Season"}
            <select value={season} onChange={(e) => { setSeason(Number(e.target.value)); setEpisode(1); }}>
              {(available.length ? available : [{ season_number: 1, episode_count: 1, name: "Season 1" }]).map((s) => (
                <option key={s.season_number} value={s.season_number}>
                  {ar ? `الموسم ${s.season_number}` : `Season ${s.season_number}`}
                </option>
              ))}
            </select>
          </label>
          <label>
            {ar ? "الحلقة" : "Episode"}
            <select value={episode} onChange={(e) => setEpisode(Number(e.target.value))}>
              {Array.from({ length: Math.max(1, current?.episode_count ?? 1) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{ar ? `الحلقة ${n}` : `Episode ${n}`}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="player-provider-bar">
        <span>
          {ar ? "المصدر الحالي:" : "Current source:"} <strong>{active?.name ?? (ar ? "غير متاح" : "Unavailable")}</strong>
          {active && !playbackStarted && <small className="player-countdown"> · {ar ? `التبديل التلقائي خلال ${secondsLeft} ثانية` : `Auto-switch in ${secondsLeft}s if playback is not detected`}</small>}
        </span>
        <button type="button" onClick={next} disabled={failed}>
          {ar ? "جرّب المصدر التالي" : "Try next source"}
        </button>
      </div>

      {active ? (
        active.kind === "youtube" && active.videoId ? (
          <YouTubePlayer key={`${active.name}-${active.videoId}`} videoId={active.videoId} onPlaying={markStarted} onError={next} />
        ) : (
          <div className="vidapi-frame">
            <iframe
              key={`${active.name}-${active.url}`}
              src={active.url}
              title={`${active.name} video player`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )
      ) : (
        <div className="player-unavailable" role="status">
          {ar ? "عذراً، لم يتم العثور على مصدر تشغيل متاح لهذا العنوان." : "Sorry, no playback source is currently available for this title."}
        </div>
      )}

      <p className="player-caption">
        {ar
          ? "يتم تجربة المصادر بالترتيب. يتم إيقاف التبديل التلقائي عند اكتشاف بدء التشغيل. قد لا تتمكن JAIFLIX من اكتشاف حالة التشغيل داخل بعض المشغلات الخارجية."
          : "Sources are tried in order. Auto-switching stops when playback is detected. Some external players do not expose playback status to JAIFLIX, so the 15-second fallback timer is best-effort for those providers."}
      </p>
      {useYoutubeFallback && !youtubeSearchDone && <p className="player-caption">{ar ? "جارٍ البحث عن الحلقة على YouTube…" : "Searching YouTube for this episode…"}</p>}
      {useYoutubeFallback && youtubeSearchDone && !youtubeResult && <p className="player-caption">{ar ? "لم يتم العثور على نتيجة YouTube قابلة للتضمين؛ سيتم تخطي هذا المصدر." : "No embeddable YouTube result was found; this fallback will be skipped."}</p>}
    </section>
  );
}
