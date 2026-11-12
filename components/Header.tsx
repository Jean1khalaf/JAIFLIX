"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Locale } from "@/lib/types";
import { text } from "@/lib/i18n";

export default function Header({ lang }: { lang: Locale }) {
  const t = text[lang], p = usePathname(), r = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const swap = lang === "en" ? "ar" : "en";
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    r.push(`/browse?lang=${lang}&q=${encodeURIComponent(String(q || ""))}`);
    setMenuOpen(false);
  }
  return <header className="header">
    <div className="container nav">
      <Link className="logo" href={`/?lang=${lang}`} aria-label="JAIFLIX home"><img src="/jaiflix-icon.png" alt="" width="30" height="30"/>JAI<span>FLIX</span></Link>
      <nav className={`links ${menuOpen ? "mobileOpen" : ""}`}>
        <Link onClick={() => setMenuOpen(false)} href={`/?lang=${lang}`}>{t.home}</Link>
        <Link onClick={() => setMenuOpen(false)} href={`/browse?lang=${lang}&type=movie`}>{t.movies}</Link>
        <Link onClick={() => setMenuOpen(false)} href={`/browse?lang=${lang}&type=series`}>{t.series}</Link>
      </nav>
      <Link className="downloadNav" href="/download">↓ Download App</Link>
      <form className="headerSearch" onSubmit={search}><input aria-label={t.search} name="q" className="search" placeholder={t.search+"..."}/></form>
      <Link className="lang" href={`${p}?lang=${swap}`}>{t.language}</Link>
      <button className="mobileMenuButton" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? "✕" : "☰"}</button>
    </div>
  </header>;
}
