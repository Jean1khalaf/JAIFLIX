import { demo } from "./data";import { Media } from "./types";
export async function getCatalog():Promise<Media[]>{return demo}
export async function getMedia(id:number){return demo.find(x=>x.id===id)||null}
