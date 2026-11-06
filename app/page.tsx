import Image from 'next/image';import Link from 'next/link';import {Info,Play} from 'lucide-react';import {discover,trending} from '@/lib/tmdb';import {tvMazeSchedule} from '@/lib/tvmaze';import Row from '@/components/Row';import {getLocale,messages} from '@/lib/i18n';
export default async function Home(){
 const lang=await getLocale(),t=messages[lang];let trend:any[]=[],movies:any[]=[],series:any[]=[],schedule:any[]=[],loadError=false;
 const results=await Promise.allSettled([
   trending(lang),
   discover('movie',1,lang).then(x=>x.items),
   discover('tv',1,lang).then(x=>x.items)
 ]);
 if(results[0].status==='fulfilled') trend=results[0].value; else loadError=true;
 if(results[1].status==='fulfilled') movies=results[1].value; else loadError=true;
 if(results[2].status==='fulfilled') series=results[2].value; else loadError=true;
 try { schedule=await tvMazeSchedule(); } catch { schedule=[]; }
 const hero=trend[0];
 return <><section className="hero" dir={lang==='ar'?'rtl':'ltr'}>{hero?.backdrop&&<Image src={hero.backdrop} alt="" fill priority sizes="100vw"/>}<div className="shade"/><div className="heroContent">{hero?<><span className="eyebrow">#1 {lang==='ar'?'الأكثر رواجاً على':'TRENDING ON'} JAIFLIX</span><h1>{hero.title}</h1><p>{hero.overview}</p><div className="actions"><Link className="primary" href={`/title/${hero.type}/${hero.id}`}><Play size={18} fill="currentColor"/> {t.viewTitle}</Link><Link className="secondary" href={`/title/${hero.type}/${hero.id}`}><Info size={18}/> {t.moreInfo}</Link></div></>:<><span className="eyebrow">WELCOME TO</span><h1>JAI<span>FLIX</span></h1><p>{lang==='ar'?'الكتالوج غير متاح مؤقتاً. يرجى التحقق من اتصال TMDB والمحاولة مرة أخرى.':'JAIFLIX catalogue is temporarily unavailable. Please check your TMDB connection and try again.'}</p></>}</div></section>
 <div className="content">{loadError&&<p className="setup-warning" dir={lang==='ar'?'rtl':'ltr'}>{lang==='ar'?'تعذر تحميل الكتالوج من TMDB. تحقق من الرمز وسجلات الخادم.':'The catalogue could not load from TMDB. Check your TMDB token and server logs.'}</p>}
 {trend.length>0&&<><Row title={t.trending} items={trend.slice(0,12)}/><p className="browse-link" dir={lang==='ar'?'rtl':'ltr'}><Link href="/browse/tv">{lang==='ar'?'تصفح كل المسلسلات ←':'Browse all series →'}</Link></p></>}
 {movies.length>0&&<><Row title={t.popularMovies} items={movies.slice(0,12)}/><p className="browse-link" dir={lang==='ar'?'rtl':'ltr'}><Link href="/browse/movie">{lang==='ar'?'تصفح كل الأفلام ←':'Browse all movies →'}</Link></p></>}
 {series.length>0&&<Row title={t.binge} items={series.slice(0,12)}/>}
 {schedule.length>0&&<section className="section" dir={lang==='ar'?'rtl':'ltr'}><div className="sectiontitle"><h2>{t.streamingToday}</h2><span>{t.today}</span></div><div className="schedule">{schedule.map((e:any)=><a href={e.url} target="_blank" rel="noreferrer" key={`${e.id}-${e.season}-${e.number}`}><b>{e.title}</b><small>S{e.season} E{e.number} · {e.episode}</small></a>)}</div></section>}</div></>;
}
