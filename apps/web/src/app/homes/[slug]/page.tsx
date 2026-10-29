import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BedDouble, Bath, Ruler, MapPin, Check } from "lucide-react";
import { getListing, formatPrice } from "@/lib/api";
import { InquiryForm } from "@/components/InquiryForm";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const home = await getListing(slug); return { title: home?.title || "Home" }; }

export default async function HomeDetail({ params }: Props) {
  const { slug } = await params; const home = await getListing(slug); if (!home) notFound();
  return <main className="page-shell detail-page">
    <Link href="/search" className="back-link"><ArrowLeft size={15}/> All homes in Bengaluru</Link>
    <div className="detail-header"><div><div className="section-label"><span>{home.type === "sale" ? "FOR SALE" : "FOR RENT"}</span> {home.address.locality.toUpperCase()}, BENGALURU</div><h1>{home.title}</h1><p className="detail-address"><MapPin size={15}/>{home.address.locality}, {home.address.city}, {home.address.state}</p></div><div className="detail-price">{formatPrice(home)}<span>{home.type === "sale" ? "Asking price" : "Monthly rent"}</span></div></div>
    <div className="detail-gallery"><img className="detail-main-image" src={home.images[0]} alt={home.title}/><img className="detail-side-image" src={home.images[1] || home.images[0]} alt={`${home.title}, additional view`}/><span className="gallery-count">01 / {String(home.images.length).padStart(2, "0")}</span></div>
    <div className="detail-layout"><div className="detail-copy"><div className="detail-stats"><span><BedDouble size={18}/>{home.bedrooms} bedrooms</span><span><Bath size={17}/>{home.bathrooms} bathrooms</span><span><Ruler size={17}/>{home.areaSqft.toLocaleString("en-IN")} sq ft</span></div><h2>A little more about <em>this home.</em></h2><p className="detail-description">{home.description}</p><div className="features-list">{home.features.map((feature) => <span key={feature}><Check size={14}/>{feature}</span>)}</div><div className="locality-note"><div className="section-label"><span>THE NEIGHBOURHOOD</span></div><p>{home.address.locality} has its own rhythm — leafy streets, local favourites, and the everyday essentials close at hand.</p></div></div><aside className="inquiry-card"><div className="section-label"><span>LET’S TALK</span></div><h2>Could this be <em>your place?</em></h2><p>Tell us a little about yourself. We’ll help you take the next step.</p><InquiryForm listing={home}/><Link href="/search" className="text-link">Explore more homes <ArrowUpRight size={14}/></Link></aside></div>
  </main>;
}
