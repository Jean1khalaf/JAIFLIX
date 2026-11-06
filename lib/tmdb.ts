import { Media } from "./types";

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

async function get(path: string) {
  const token = process.env.TMDB_BEARER_TOKEN?.trim();
  if (!token || token === "your_tmdb_read_access_token") {
    throw new Error("TMDB_BEARER_TOKEN is not configured. Add your TMDB API Read Access Token to .env.local.");
  }
  const response = await fetch(BASE + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    next: { revalidate: 1800 },
  });
  if (!response.ok) {
    const detail = response.status === 401 ? "TMDB rejected the token (401). Check that you copied the API Read Access Token, not the API key." :
      response.status === 403 ? "TMDB denied this request (403). Check your account/API access." :
      `TMDB request failed (${response.status}).`;
    throw new Error(detail);
  }
  return response.json();
}

function map(x: any, type: "movie" | "tv"): Media {
  return {
    id: x.id, title: x.title || x.name, overview: x.overview || "No synopsis available.",
    poster: x.poster_path ? IMG + x.poster_path : null,
    backdrop: x.backdrop_path ? IMG + x.backdrop_path : null,
    rating: Number(x.vote_average || 0),
    year: (x.release_date || x.first_air_date || "").slice(0, 4), type,
  };
}

export async function trending() {
  const data = await get("/trending/all/week?language=en-US");
  return data.results.filter((x: any) => x.media_type === "movie" || x.media_type === "tv")
    .map((x: any) => map(x, x.media_type));
}

export async function discover(type: "movie" | "tv") {
  const data = await get(`/discover/${type}?include_adult=false&language=en-US&sort_by=popularity.desc`);
  return data.results.map((x: any) => map(x, type));
}

export async function discoverOriginalLanguage(language: "tr" | "ar") {
  const displayLanguage = language === "tr" ? "tr-TR" : "ar";
  const data = await get(`/discover/tv?include_adult=false&with_original_language=${language}&language=${displayLanguage}&sort_by=popularity.desc`);
  return data.results.map((x: any) => map(x, "tv"));
}

export async function details(type: "movie" | "tv", id: string) {
  const data = await get(`/${type}/${id}?language=en-US&append_to_response=videos,credits`);
  return {
    ...map(data, type), genres: data.genres?.map((g: any) => g.name) || [],
    runtime: data.runtime || data.episode_run_time?.[0], seasons: data.number_of_seasons,
    cast: data.credits?.cast?.slice(0, 8) || [],
    videos: data.videos?.results?.filter((v: any) => v.site === "YouTube").slice(0, 3) || [],
  };
}

export async function search(q: string) {
  const data = await get(`/search/multi?query=${encodeURIComponent(q)}&include_adult=false&language=en-US`);
  return data.results.filter((x: any) => x.media_type === "movie" || x.media_type === "tv")
    .map((x: any) => map(x, x.media_type));
}
