"use client";

import { useEffect, useMemo, useState } from "react";

type Season = { season_number: number; episode_count: number; name: string };
type Provider = { name: string; url: string; note?: string };

function fillTemplate(template: string, values: { id: string; season: number; episode: number }) {
  return template
    .replaceAll("{id}", encodeURIComponent(values.id))
    .replaceAll("{season}", String(values.season))
    .replaceAll("{episode}", String(values.episode));
}

export default function VidApiPlayer({
  type,
  id,
  imdbId,
  seasons = [],
  lang = "en",
}: {
  type: "movie" | "tv";
  id: string;
  imdbId?: string;
  seasons?: Season[];
  lang?: "en" | "ar";
}) {
  const available = seasons.filter((s) => s.season_number > 0 && s.episode_count > 0);
  const [season, setSeason] = useState(available[0]?.season_number ?? 1);
  const current = available.find((s) => s.season_number === season);
  const [episode, setEpisode] = useState(1);
  const [providerIndex, setProviderIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const ar = lang === "ar";

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
      ...(vidukiUrl ? [{ name: "Viduki", url: vidukiUrl }] : []),
      { name: "ezvidapi", url: ezvidUrl },
      { name: "vidapi.ru", url: vidapiRuUrl },
    ];
  }, [type, id, imdbId, season, episode, lang]);

  // Reset to the primary source when the selected title or episode changes.
  useEffect(() => {
    setProviderIndex(0);
    setFailed(false);
  }, [type, id, season, episode]);

  // Viduki documents a cross-frame message for the specific case where all
  // of its internal servers fail. Other providers do not expose a common,
  // reliable cross-origin playback-error signal.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.viduki.net") return;
      if (event.data?.type !== "viduki:all-servers-failed") return;
      setProviderIndex((currentIndex) => Math.min(currentIndex + 1, providers.length));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [providers.length]);

  const active = providers[providerIndex];
  const next = () => {
    if (providerIndex + 1 >= providers.length) {
      setProviderIndex(providers.length);
      setFailed(true);
      return;
    }
    setProviderIndex((value) => value + 1);
    setFailed(false);
  };

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
        <span>{ar ? "المصدر الحالي:" : "Current source:"} <strong>{active?.name ?? (ar ? "غير متاح" : "Unavailable")}</strong></span>
        <button type="button" onClick={next} disabled={failed}>
          {ar ? "جرّب المصدر التالي" : "Try next source"}
        </button>
      </div>

      {active ? (
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
      ) : (
        <div className="player-unavailable" role="status">
          {ar ? "عذراً، لم يتم العثور على مصدر تشغيل متاح لهذا العنوان." : "Sorry, no playback source is currently available for this title."}
        </div>
      )}

      <p className="player-caption">
        {ar
          ? "يتم التبديل بين المصادر بالترتيب. إذا لم يعمل المشغل، اختر «جرّب المصدر التالي»."
          : "Sources are tried in order. If playback does not start or reports an error, select “Try next source” to continue."}
      </p>
    </section>
  );
}
