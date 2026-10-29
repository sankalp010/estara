"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <Link className="wordmark" href="/" aria-label="Estara home"><span className="wordmark-icon">e</span>estara<span className="wordmark-period">.</span></Link>
    <nav className={open ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
      <Link href="/search?type=sale" onClick={() => setOpen(false)}>Buy</Link><Link href="/search?type=rent" onClick={() => setOpen(false)}>Rent</Link><a href="/#about" onClick={() => setOpen(false)}>Our approach</a>
      <Link className="nav-cta" href="/search">Find a home <span aria-hidden="true">↗</span></Link>
    </nav>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={21}/> : <Menu size={21}/>}</button>
  </header>;
}
