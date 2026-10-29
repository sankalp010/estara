import Link from "next/link";
import type { Listing } from "@estara/shared";
import { ArrowUpRight, BedDouble, Ruler } from "lucide-react";
import { formatPrice } from "@/lib/api";

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  return <article className={`listing-card card-${index % 3}`}>
    <Link href={`/homes/${listing.slug}`} className="listing-image-wrap" aria-label={`View ${listing.title}`}>
      <img className="listing-image" src={listing.images[0]} alt={`${listing.propertyType} in ${listing.address.locality}`} loading={index > 2 ? "lazy" : "eager"}/>
      <span className="image-tag">{listing.type === "sale" ? "For sale" : "For rent"}</span>
      <span className="image-arrow"><ArrowUpRight size={18}/></span>
    </Link>
    <div className="listing-card-copy">
      <div className="listing-price">{formatPrice(listing)}</div>
      <Link href={`/homes/${listing.slug}`} className="listing-title">{listing.title}</Link>
      <p className="listing-location">{listing.address.locality}, Bengaluru</p>
      <div className="listing-specs"><span><BedDouble size={15}/> {listing.bedrooms} beds</span><span><Ruler size={14}/> {listing.areaSqft.toLocaleString("en-IN")} sq ft</span></div>
    </div>
  </article>;
}
