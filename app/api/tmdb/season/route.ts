import {NextRequest,NextResponse} from "next/server";
import {seasonEpisodes} from "@/lib/tmdb";
export async function GET(req:NextRequest){
 const q=req.nextUrl.searchParams,id=Number(q.get("id")),season=Math.max(0,Number(q.get("season"))||0),lang=q.get("lang")==="ar"?"ar-SA":"en-US";
 if(!Number.isInteger(id)||id<=0)return NextResponse.json({error:"Invalid series id"},{status:400});
 try{return NextResponse.json({episodes:await seasonEpisodes(id,season,lang)},{headers:{"Cache-Control":"public, s-maxage=1800, stale-while-revalidate=3600"}})}
 catch{return NextResponse.json({error:"Could not load episode list"},{status:502})}
}
