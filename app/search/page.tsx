import Row from '@/components/Row';import Pagination from '@/components/Pagination';import {search} from '@/lib/tmdb';import {getLocale,messages} from '@/lib/i18n';
export default async function Search({searchParams}:{searchParams:Promise<{q?:string,page?:string}>}){
 const {q="",page:rawPage}=await searchParams,lang=await getLocale(),t=messages[lang],page=Math.max(1,Number(rawPage)||1);
 const result=q?await search(q,page,lang):{items:[],page:1,totalPages:1,totalResults:0};
 return <div className="page" dir={lang==="ar"?"rtl":"ltr"}><span className="eyebrow">SEARCH · بحث</span><h1>{q?`${lang==="ar"?"نتائج البحث عن":"Results for"} “${q}”`:t.find}</h1>
 {result.items.length?<><Row title={t.results} items={result.items}/><Pagination page={result.page} totalPages={result.totalPages} baseUrl={`/search?q=${encodeURIComponent(q)}`} lang={lang}/></>:<p className="muted">{q?t.noResults:t.searchHint}</p>}</div>;
}
