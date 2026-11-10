export const dynamic = "force-dynamic";
import Header from "@/components/Header";
import EpisodePicker from "@/components/EpisodePicker";
import PlaybackSwitcher from "@/components/PlaybackSwitcher";
import { details } from "@/lib/tmdb";
import { notFound } from "next/navigation";
import { localized } from "@/lib/i18n";
import { Locale } from "@/lib/types";

export default async function Watch({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string; type?: string; season?: string; episode?: string }>;
}) {
  const [p, s] = await Promise.all([params, searchParams]);
  const type = s.type === "series" ? "series" : "movie";
  const lang: Locale = s.lang === "ar" ? "ar" : "en";
  const season = Math.max(1, Number(s.season) || 1);
  const episode = Math.max(1, Number(s.episode) || 1);
  let media;
  try {
    media = await details(type, Number(p.id), lang === "ar" ? "ar-SA" : "en-US");
  } catch {
    media = null;
  }
  if (!media) notFound();

  const base = (process.env.NEXT_PUBLIC_VIDAPI_BASE || "https://vaplayer.ru").replace(/\/$/, "");
  const path = type === "movie"
    ? `/embed/movie/${media.tmdbId}`
    : `/embed/tv/${media.tmdbId}/${season}/${episode}`;
  const query = new URLSearchParams({
    primaryColor: "#e50914",
    ds_lang: lang,
    title: localized(media, lang, "title"),
    autoplay: "0",
  });
  const vidApiSrc = `${base}${path}?${query.toString()}`;

  return <div dir={lang === "ar" ? "rtl" : "ltr"}>
    <Header lang={lang} />
    <main className="container playerWrap">
      <h1>{localized(media, lang, "title")}</h1>
      {type === "series" && <EpisodePicker id={media.tmdbId} lang={lang} seasons={media.seasons || 1} currentSeason={season} currentEpisode={episode} />}
      <PlaybackSwitcher
        vidApiSrc={vidApiSrc}
        title={media.titleEn}
        titleAr={media.titleAr}
        type={type}
        season={season}
        episode={episode}
        lang={lang}
      />
    </main>
  </div>;
}
