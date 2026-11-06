import {Media} from '@/lib/types';import MediaCard from './MediaCard';
export default function Row({title,items}:{title:string,items:Media[]}){return <section className="section"><div className="sectiontitle"><h2>{title}</h2><span>{items.length} titles</span></div><div className="grid">{items.map(m=><MediaCard key={`${m.type}-${m.id}`} m={m}/>)}</div></section>}
