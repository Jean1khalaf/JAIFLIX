import { Media } from "./types";
const BASE="https://api.themoviedb.org/3";
const IMG="https://image.tmdb.org/t/p/original";
const token=process.env.TMDB_BEARER_TOKEN;
async function get(path:string){ if(!token) throw new Error("TMDB_BEARER_TOKEN is missing"); const r=await fetch(BASE+path,{headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},next:{revalidate:1800}}); if(!r.ok) throw new Error(`TMDB ${r.status}`); return r.json(); }
function map(x:any,type:"movie"|"tv"):Media{return {id:x.id,title:x.title||x.name,overview:x.overview||"No synopsis available.",poster:x.poster_path?IMG+x.poster_path:null,backdrop:x.backdrop_path?IMG+x.backdrop_path:null,rating:Number(x.vote_average||0),year:(x.release_date||x.first_air_date||"").slice(0,4),type};}
export async function trending(){const d=await get('/trending/all/week?language=en-US');return d.results.filter((x:any)=>x.media_type==='movie'||x.media_type==='tv').map((x:any)=>map(x,x.media_type));}
export async function discover(type:"movie"|"tv"){const d=await get(`/discover/${type}?include_adult=false&language=en-US&sort_by=popularity.desc`);return d.results.map((x:any)=>map(x,type));}
export async function details(type:"movie"|"tv",id:string,locale:"en"|"ar"="en"){const language=locale==="ar"?"ar-SA":"en-US";const d=await get(`/${type}/${id}?language=${language}&append_to_response=videos,credits`);return {...map(d,type),genres:d.genres?.map((g:any)=>g.name)||[],runtime:d.runtime||d.episode_run_time?.[0],seasons:d.number_of_seasons,cast:d.credits?.cast?.slice(0,8)||[],videos:d.videos?.results?.filter((v:any)=>v.site==='YouTube').slice(0,3)||[]};}
export async function search(q:string){const d=await get(`/search/multi?query=${encodeURIComponent(q)}&include_adult=false&language=en-US`);return d.results.filter((x:any)=>x.media_type==='movie'||x.media_type==='tv').map((x:any)=>map(x,x.media_type));}
