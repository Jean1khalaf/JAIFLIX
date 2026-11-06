"use client";
import Link from 'next/link';
import { Menu,Search,X,Languages } from 'lucide-react';
import { useState } from 'react';
export default function Header({lang='en'}:{lang?:'en'|'ar'}) {
 const [open,setOpen]=useState(false);
 const ar=lang==='ar';
 const t=ar?{home:'الرئيسية',movies:'الأفلام',series:'المسلسلات',list:'قائمتي',search:'ابحث عن الأفلام والمسلسلات...',switch:'English'}:{home:'Home',movies:'Movies',series:'Series',list:'My list',search:'Search movies, series...',switch:'العربية'};
 function toggle(){document.cookie=`jaiflix_locale=${ar?'en':'ar'}; path=/; max-age=31536000; samesite=lax`;window.location.reload();}
 return <header className="header" dir={ar?'rtl':'ltr'}>
  <Link href="/" className="brand">JAI<span>FLIX</span></Link>
  <nav className={open?'nav open':'nav'}><Link href="/">{t.home}</Link><Link href="/browse/movie">{t.movies}</Link><Link href="/browse/tv">{t.series}</Link><Link href="/my-list">{t.list}</Link></nav>
  <form action="/search" className="search"><Search size={18}/><input name="q" aria-label={t.search} placeholder={t.search}/></form>
  <button className="language" onClick={toggle} aria-label="Switch language"><Languages size={16}/>{t.switch}</button>
  <button className="menu" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>
 </header>;
}
