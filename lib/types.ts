export type Locale = "en" | "ar";
export type Media = { id:number; tmdbId:number; type:"movie"|"series"; titleEn:string; titleAr:string; descriptionEn:string; descriptionAr:string; category:"international"|"turkish"|"arabic"|"lebanese"|"syrian"; year:number; rating:number; runtime:string; poster:string; backdrop:string; featured:boolean; seasons?:number };
