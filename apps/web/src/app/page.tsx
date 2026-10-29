import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveUpRight } from "lucide-react";
import { getListings } from "@/lib/api";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";

export default async function HomePage() {
  const homes = await getListings();
  const featured = homes.filter((home) => home.featured).slice(0, 3);
  return <main>
    <section className="hero">
      <div className="hero-image" role="img" aria-label="A sunlit, contemporary home surrounded by greenery"/>
      <div className="hero-shade"/>
      <div className="hero-content page-shell">
        <div className="eyebrow"><span className="eyebrow-dot"/> A more considered way home <span className="eyebrow-line"/></div>
        <h1>Find a place<br/>that feels like <em>you.</em></h1>
        <p className="hero-subtitle">Good homes change how a day feels.<br/>Let’s find one that fits yours.</p>
        <SearchBar/>
        <div className="hero-bottom"><span>01 — BENGALURU, INDIA</span><a href="#collection">Scroll to discover <ArrowDown size={14}/></a></div>
      </div>
      <span className="hero-index">Thoughtfully found · Est. 2025</span>
    </section>

    <section className="intro-section page-shell" id="about">
      <div className="section-label"><span>01</span> THE ESTARA EDIT</div>
      <div className="intro-copy"><h2>Home is more than<br/>an <em>address.</em></h2><p>It’s the light at 4pm. The walk to your favourite coffee. A little more room to grow. We look for the details that make a place feel like yours — and bring the good ones closer.</p><Link className="text-link" href="/search">A different way to find home <MoveUpRight size={16}/></Link></div>
      <div className="intro-image"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85" alt="An open, sunlit living room" loading="lazy"/><span className="image-caption">A softer pace, in the middle of the city.</span></div>
    </section>

    <section className="collection-section" id="collection"><div className="page-shell">
      <div className="collection-heading"><div><div className="section-label"><span>02</span> A FEW GOOD PLACES</div><h2>Made for <em>living.</em></h2></div><Link className="round-link" href="/search" aria-label="Browse all homes"><ArrowUpRight size={20}/></Link></div>
      <div className="listing-grid">{featured.map((listing, index) => <ListingCard key={listing._id} listing={listing} index={index}/>)}</div>
      <Link className="collection-link" href="/search">See all homes <span><ArrowUpRight size={16}/></span></Link>
    </div></section>

    <section className="quote-section page-shell"><div className="quote-mark">“</div><blockquote>A good home doesn’t ask you to become someone else. It makes more room for who you already are.</blockquote><span className="quote-credit">THE ESTARA POINT OF VIEW</span></section>

    <section className="closing-cta"><div className="closing-image"/><div className="closing-content"><div className="section-label"><span>03</span> YOUR NEXT CHAPTER</div><h2>There’s a place<br/>with your <em>name on it.</em></h2><Link href="/search" className="light-button">Find your place <ArrowUpRight size={17}/></Link><p>Sale and rental homes, thoughtfully found across Bengaluru.</p></div></section>
  </main>;
}
