import {NextResponse} from "next/server";import {getCatalog} from "@/lib/db";
export async function GET(){return NextResponse.json(await getCatalog(),{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}})}
