"use client";
import {useMemo,useState} from 'react';

type Season={season_number:number;episode_count:number;name:string};
export default function VidApiPlayer({type,id,imdbId,seasons=[],lang='en'}:{
  type:'movie'|'tv';id:string;imdbId?:string;seasons?:Season[];lang?:'en'|'ar'
}) {
  const available=seasons.filter(s=>s.season_number>0 && s.episode_count>0);
  const [season,setSeason]=useState(available[0]?.season_number ?? 1);
  const current=available.find(s=>s.season_number===season);
  const [episode,setEpisode]=useState(1);
  const src=useMemo(()=>{
    const base='https://vaplayer.ru/embed';
    const providerId=imdbId || id;
    return type==='movie' ? `${base}/movie/${encodeURIComponent(providerId)}?primaryColor=%23e50914&lang=${lang}` :
      `${base}/tv/${encodeURIComponent(providerId)}/${season}/${episode}?primaryColor=%23e50914&lang=${lang}`;
  },[type,id,imdbId,season,episode,lang]);
  const ar=lang==='ar';
  return <section className="vidapi-player" dir={ar?'rtl':'ltr'}>
    {type==='tv' && <div className="episode-controls">
      <label>{ar?'الموسم':'Season'}
        <select value={season} onChange={e=>{setSeason(Number(e.target.value));setEpisode(1);}}>
          {(available.length?available:[{season_number:1,episode_count:1,name:'Season 1'}]).map(s=><option key={s.season_number} value={s.season_number}>{ar?`الموسم ${s.season_number}`:`Season ${s.season_number}`}</option>)}
        </select>
      </label>
      <label>{ar?'الحلقة':'Episode'}
        <select value={episode} onChange={e=>setEpisode(Number(e.target.value))}>
          {Array.from({length:Math.max(1,current?.episode_count??1)},(_,i)=>i+1).map(n=><option key={n} value={n}>{ar?`الحلقة ${n}`:`Episode ${n}`}</option>)}
        </select>
      </label>
    </div>}
    <div className="vidapi-frame">
      <iframe key={src} src={src} title={ar?'مشغل الفيديو':'VidAPI video player'}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
    </div>
    <p className="player-caption">{ar?'يتم التشغيل عبر VidAPI. إذا ظهر خطأ 404 فقد لا يكون العنوان أو الحلقة متاحاً في مكتبته.':'Playback is provided by VidAPI. If its player reports 404, that title or episode may not be in its catalogue.'}</p>
  </section>;
}
