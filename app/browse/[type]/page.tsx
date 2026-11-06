import Row from '@/components/Row';import Pagination from '@/components/Pagination';import {discover} from '@/lib/tmdb';import {notFound} from 'next/navigation';import Link from 'next/link';import {getLocale,messages} from '@/lib/i18n';
export default async function Browse({params,searchParams}:{params:Promise<{type:string}>,searchParams:Promise<{page?:string,filter?:string}>}){
 const {type}=await params;const {page:rawPage,filter:rawFilter}=await searchParams;
 if(type!=="movie"&&type!=="tv")notFound();
 const lang=await getLocale(),t=messages[lang],page=Math.max(1,Number(rawPage)||1),filter=["all","turkish","arabic","lebanese"].includes(rawFilter||"")?rawFilter||"all":"all";
 const result=await discover(type,page,lang,filter);
 const labels=lang==="ar"?{all:"الكل",turkish:"تركي",arabic:"عربي",lebanese:"لبناني"}:{all:"All",turkish:"Turkish",arabic:"Arabic",lebanese:"Lebanese"};
 const base=`/browse/${type}?filter=${filter}`;
 return <div className="page" dir={lang==="ar"?"rtl":"ltr"}><span className="eyebrow">{t.explore}</span><h1>{type==="movie"?t.movies:t.series}</h1>
 <div className="filters">{(["all","turkish","arabic","lebanese"] as const).map(f=><Link key={f} className={filter===f?"filter active":"filter"} href={`/browse/${type}?filter=${f}`}>{labels[f]}</Link>)}</div>
 {result.items.length?<Row title={t.popularNow} items={result.items}/>:<p className="muted">{t.noResults}</p>}
 <Pagination page={result.page} totalPages={result.totalPages} baseUrl={base} lang={lang}/>
 </div>;
}
