import { neon } from "@neondatabase/serverless";
import { demo } from "./data";
import { Media } from "./types";
export async function getCatalog():Promise<Media[]> {
 if(!process.env.DATABASE_URL) return demo;
 try { const sql=neon(process.env.DATABASE_URL); const rows=await sql`SELECT id, tmdb_id, type, title_en, title_ar, description_en, description_ar, category, year, rating, runtime, poster, backdrop, featured, seasons FROM media ORDER BY featured DESC,id`;
 return rows.map((r:any)=>({id:r.id,tmdbId:r.tmdb_id,type:r.type,titleEn:r.title_en,titleAr:r.title_ar,descriptionEn:r.description_en,descriptionAr:r.description_ar,category:r.category,year:r.year,rating:Number(r.rating),runtime:r.runtime,poster:r.poster,backdrop:r.backdrop,featured:r.featured,seasons:r.seasons}));
 } catch(e){ console.error("Database fallback:",e); return demo; }
}
export async function getMedia(id:number){return (await getCatalog()).find(x=>x.id===id)||null;}
