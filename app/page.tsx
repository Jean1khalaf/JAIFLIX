import Image from 'next/image';
import Link from 'next/link';
import { Info, Play } from 'lucide-react';
import { discover, discoverOriginalLanguage, trending } from '@/lib/tmdb';
import { tvMazeSchedule } from '@/lib/tvmaze';
import Row from '@/components/Row';

export default async function Home() {
  // Keep each feed independent: a temporary API failure should not hide every other section.
  const [trend, movies, series, turkish, arabic, schedule] = await Promise.all([
    trending().catch(() => []), discover('movie').catch(() => []), discover('tv').catch(() => []),
    discoverOriginalLanguage('tr').catch(() => []), discoverOriginalLanguage('ar').catch(() => []),
    tvMazeSchedule().catch(() => []),
  ]);
  const hero = trend[0];
  return <>{hero ? <section className="hero">
    {hero.backdrop && <Image src={hero.backdrop} alt="" fill priority sizes="100vw" />}
    <div className="shade" /><div className="heroContent">
      <span className="eyebrow">#1 TRENDING ON JAIFLIX</span><h1>{hero.title}</h1><p>{hero.overview}</p>
      <div className="actions"><Link className="primary" href={`/title/${hero.type}/${hero.id}`}><Play size={18} fill="currentColor" /> View title</Link>
        <Link className="secondary" href={`/title/${hero.type}/${hero.id}`}><Info size={18} /> More info</Link></div>
    </div></section> : <section className="hero fallback"><div className="heroContent">
      <span className="eyebrow">WELCOME TO</span><h1>JAI<span>FLIX</span></h1>
      <p>Connect your TMDB API Read Access Token in .env.local to load movies and series.</p>
    </div></section>}
    <div className="content">
      {trend.length > 0 && <Row title="Trending now" items={trend.slice(0, 12)} />}
      {turkish.length > 0 && <Row title="Turkish series" items={turkish.slice(0, 12)} />}
      {arabic.length > 0 && <Row title="Arabic series" items={arabic.slice(0, 12)} />}
      {movies.length > 0 && <Row title="Popular movies" items={movies.slice(0, 12)} />}
      {series.length > 0 && <Row title="Popular series" items={series.slice(0, 12)} />}
      {schedule.length > 0 && <section className="section"><div className="sectiontitle"><h2>Streaming today</h2><span>TVmaze schedule</span></div>
        <div className="schedule">{schedule.map((e: any) => <a href={e.url} target="_blank" rel="noreferrer" key={`${e.id}-${e.season}-${e.number}`}>
          <b>{e.title}</b><small>S{e.season} E{e.number} · {e.episode}</small></a>)}</div></section>}
    </div></>;
}
