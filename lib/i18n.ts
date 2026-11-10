import { Locale } from "./types";
export const text = {
 en:{home:"Home",movies:"Movies",series:"Series",myList:"My List",search:"Search",all:"All",international:"International",turkish:"Turkish",arabic:"Arabic",lebanese:"Lebanese",syrian:"Syrian",play:"Play",details:"More info",trending:"Trending now",browse:"Browse",results:"results",page:"Page",of:"of",previous:"Previous",next:"Next",overview:"Overview",watch:"Watch now",language:"العربية",empty:"No titles found",legal:"JAIFLIX does not host video files. Stream only content you are authorized to distribute."},
 ar:{home:"الرئيسية",movies:"أفلام",series:"مسلسلات",myList:"قائمتي",search:"بحث",all:"الكل",international:"عالمي",turkish:"تركي",arabic:"عربي",lebanese:"لبناني",syrian:"سوري",play:"تشغيل",details:"معلومات أكثر",trending:"الأكثر رواجاً",browse:"تصفح",results:"نتيجة",page:"الصفحة",of:"من",previous:"السابق",next:"التالي",overview:"نبذة",watch:"شاهد الآن",language:"English",empty:"لا توجد نتائج",legal:"لا يستضيف JAIFLIX ملفات الفيديو. اعرض فقط المحتوى المصرح لك بتوزيعه."}
} as const;
export const localized=(m:any,l:Locale,key:"title"|"description")=>m[`${key}${l==="ar"?"Ar":"En"}`];
