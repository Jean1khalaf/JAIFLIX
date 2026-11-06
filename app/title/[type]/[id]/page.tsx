import Image from 'next/image';
import {notFound} from 'next/navigation';
import Trailer from '@/components/Trailer';
import VidApiPlayer from '@/components/VidApiPlayer';
import {details} from '@/lib/tmdb';
import {Star} from 'lucide-react';
import {getLocale,messages} from '@/lib/i18n';

export default async function Title({params}:{params:Promise<{type:string,id:string}>}) {
 const {type,id}=await params;
 if(type!=='movie'&&type!=='tv')notFound();
 const lang=await getLocale(),t=messages[lang],d:any=await details(type,id,lang);
 return <section className="detail" dir={lang==='ar'?'rtl':'ltr'}>
  {d.backdrop&&<Image src={d.backdrop} alt="" fill priority sizes="100vw"/>}
  <div className="shade"/>
  <div className="detailContent">
   <span className="eyebrow">{type==='tv'?t.seriesType:t.movie} · {d.year}</span>
   <h1>{d.title}</h1>
   <div className="meta"><span><Star size={15} fill="currentColor"/> {d.rating.toFixed(1)}</span><span>{d.runtime?`${d.runtime} ${lang==='ar'?'دقيقة':'min'}`:d.seasons?`${d.seasons} ${lang==='ar'?'مواسم':'seasons'}`:'New'}</span><span>{d.genres.join(' · ')}</span></div>
   <p>{d.overview}</p>
   <div className="actions"><Trailer videoKey={d.videos?.[0]?.key} lang={lang}/></div>
   <VidApiPlayer type={type} id={id} seasons={d.seasonList||[]} lang={lang}/>
   {d.cast?.length>0&&<div className="cast"><h2>{t.topCast}</h2><div>{d.cast.map((c:any)=><span key={c.id}><b>{c.name}</b><small>{c.character}</small></span>)}</div></div>}
  </div>
 </section>;
}
