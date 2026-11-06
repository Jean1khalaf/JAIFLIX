import { Media } from "./types";
const BASE="https://api.themoviedb.org/3";
const IMG="https://image.tmdb.org/t/p/original";
const token=process.env.TMDB_BEARER_TOKEN;
async function get(path:string){
  if(!token) throw new Error("TMDB_BEARER_TOKEN is missing. Add your TMDB Read Access Token to the hosting environment.");
  const r=await fetch(BASE+path,{headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},next:{revalidate:1800}});
  if(!r.ok) throw new Error(`TMDB request failed (${r.status})`);
  return r.json();
}
function map(x:any,type:"movie"|"tv"):Media{return {id:x.id,title:x.title||x.name||x.original_title||x.original_name,overview:x.overview||"No synopsis available.",poster:x.poster_path?IMG+x.poster_path:null,backdrop:x.backdrop_path?IMG+x.backdrop_path:null,rating:Number(x.vote_average||0),year:(x.release_date||x.first_air_date||"").slice(0,4),type};}
const lang=(locale:"en"|"ar")=>locale==="ar"?"ar-SA":"en-US";
export async function trending(locale:"en"|"ar"="en"){const d=await get(`/trending/all/week?language=${lang(locale)}`);return d.results.filter((x:any)=>x.media_type==="movie"||x.media_type==="tv").map((x:any)=>map(x,x.media_type));}
export async function discover(type:"movie"|"tv",page=1,locale:"en"|"ar"="en",filter="all"){
  const params=new URLSearchParams({include_adult:"false",language:lang(locale),sort_by:"popularity.desc",page:String(Math.min(500,Math.max(1,page)))});
  if(filter==="turkish"){params.set("with_origin_country","TR");}
  if(filter==="arabic"){params.set("with_original_language","ar");}
  if(filter==="lebanese"){params.set("with_origin_country","LB");}
  const d=await get(`/discover/${type}?${params.toString()}`);
  return {items:d.results.map((x:any)=>map(x,type)),page:d.page||page,totalPages:Math.min(d.total_pages||1,500),totalResults:d.total_results||0};
}
export async function details(type:"movie"|"tv",id:string,locale:"en"|"ar"="en"){const language=lang(locale);const d=await get(`/${type}/${id}?language=${language}&append_to_response=videos,credits`);return {...map(d,type),genres:d.genres?.map((g:any)=>g.name)||[],runtime:d.runtime||d.episode_run_time?.[0],seasons:d.number_of_seasons,seasonList:(d.seasons||[]).map((s:any)=>({season_number:s.season_number,episode_count:s.episode_count,name:s.name})),cast:d.credits?.cast?.slice(0,8)||[],videos:d.videos?.results?.filter((v:any)=>v.site==="YouTube").slice(0,3)||[]};}
export async function search(q:string,page=1,locale:"en"|"ar"="en"){
  const d=await get(`/search/multi?query=${encodeURIComponent(q)}&include_adult=false&language=${lang(locale)}&page=${Math.max(1,Math.min(500,page))}`);
  return {items:d.results.filter((x:any)=>x.media_type==="movie"||x.media_type==="tv").map((x:any)=>map(x,x.media_type)),page:d.page||page,totalPages:Math.min(d.total_pages||1,500),totalResults:d.total_results||0};
}
