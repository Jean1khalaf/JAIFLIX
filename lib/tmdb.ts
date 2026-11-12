import { Media } from "./types";
const API="https://api.themoviedb.org/3", IMG="https://image.tmdb.org/t/p";
type TmdbItem={id:number;media_type?:"movie"|"tv"|"person";title?:string;name?:string;original_title?:string;original_name?:string;overview?:string;poster_path?:string|null;backdrop_path?:string|null;release_date?:string;first_air_date?:string;vote_average?:number;original_language?:string;origin_country?:string[];runtime?:number;number_of_seasons?:number;seasons?:unknown[]};
type TmdbList={page:number;total_pages:number;total_results:number;results:TmdbItem[]};
async function request<T>(path:string,params:Record<string,string|number|boolean|undefined>={}):Promise<T>{
 const url=new URL(API+path); Object.entries(params).forEach(([k,v])=>{if(v!==undefined)url.searchParams.set(k,String(v))});
 const token=process.env.TMDB_READ_ACCESS_TOKEN?.trim(),key=process.env.TMDB_API_KEY?.trim();
 if(key)url.searchParams.set("api_key",key); if(!token&&!key)throw new Error("TMDB credentials are not configured");
 const res=await fetch(url,{headers:{accept:"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},next:{revalidate:1800}});
 if(!res.ok)throw new Error(`TMDB request failed (${res.status})`); return await res.json() as T;
}
function category(x:TmdbItem):Media["category"]{const c=x.origin_country||[];if(c.includes("TR")||x.original_language==="tr")return"turkish";if(c.includes("LB"))return"lebanese";if(c.includes("SY"))return"syrian";if(x.original_language==="ar")return"arabic";return"international"}
function map(x:TmdbItem,type?:"movie"|"series",ar?:TmdbItem):Media|null{const kind=type||(x.media_type==="tv"?"series":x.media_type==="movie"?"movie":null);if(!kind||!x.poster_path)return null;const d=x.release_date||x.first_air_date||"";return{id:x.id,tmdbId:x.id,type:kind,titleEn:x.title||x.name||x.original_title||x.original_name||"Untitled",titleAr:ar?.title||ar?.name||x.title||x.name||"بدون عنوان",descriptionEn:x.overview||"",descriptionAr:ar?.overview||x.overview||"",category:category(x),year:Number(d.slice(0,4))||0,rating:Number((x.vote_average||0).toFixed(1)),runtime:kind==="series"?"TV series":"Movie",poster:`${IMG}/w500${x.poster_path}`,backdrop:x.backdrop_path?`${IMG}/original${x.backdrop_path}`:`${IMG}/original${x.poster_path}`,featured:false}}
export async function trending(lang="en-US",page=1){const d=await request<TmdbList>("/trending/all/week",{language:lang,page});return d.results.map(x=>map(x)).filter((x):x is Media=>x!==null)}
export async function discover(type:"movie"|"series",o:{lang?:string,page?:number,category?:string}={}){const f:Record<string,string|number|boolean|undefined>={language:o.lang||"en-US",page:o.page||1,include_adult:false,sort_by:"popularity.desc"};if(o.category==="turkish")f.with_original_language="tr";if(["arabic","lebanese","syrian"].includes(o.category||""))f.with_original_language="ar";if(o.category==="lebanese")f.with_origin_country="LB";if(o.category==="syrian")f.with_origin_country="SY";const d=await request<TmdbList>(type==="movie"?"/discover/movie":"/discover/tv",f);return{items:d.results.map(x=>map(x,type)).filter((x):x is Media=>x!==null),page:d.page,totalPages:Math.min(d.total_pages,500),totalResults:d.total_results}}
export async function search(q:string,lang="en-US",page=1){const d=await request<TmdbList>("/search/multi",{query:q,language:lang,page,include_adult:false});return{items:d.results.map(x=>map(x)).filter((x):x is Media=>x!==null),page:d.page,totalPages:Math.min(d.total_pages,500),totalResults:d.total_results}}
export async function details(type:"movie"|"series",id:number,lang="en-US"){const path=type==="movie"?`/movie/${id}`:`/tv/${id}`;const base=await request<TmdbItem>(path,{language:lang});const ar=await request<TmdbItem>(path,{language:"ar-SA"}).catch(()=>undefined);const item=map(base,type,ar);if(!item)return null;item.runtime=type==="movie"?(base.runtime?`${base.runtime} min`:"Movie"):(base.number_of_seasons?`${base.number_of_seasons} seasons`:"TV series");item.seasons=base.number_of_seasons;return item}


export async function seasonEpisodes(id:number,season:number,lang="en-US"){
 const data=await request<{episodes?:Array<{episode_number:number;name?:string;still_path?:string|null;overview?:string;air_date?:string}>}>(`/tv/${id}/season/${season}`,{language:lang});
 return (data.episodes||[]).map(e=>({number:e.episode_number,title:e.name||`Episode ${e.episode_number}`,overview:e.overview||"",airDate:e.air_date||""}));
}
