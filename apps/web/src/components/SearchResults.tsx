"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Listing } from "@estara/shared";
import { ListingCard } from "@/components/ListingCard";
import { Search, SlidersHorizontal } from "lucide-react";

type Initial = { type?: string; locality?: string; bedrooms?: string; minPrice?: string; maxPrice?: string; sort?: string };

export function SearchResults({ listings, initial }: { listings: Listing[]; initial: Initial }) {
  const router = useRouter();
  const [values, setValues] = useState({ type: initial.type || "", locality: initial.locality || "", bedrooms: initial.bedrooms || "", minPrice: initial.minPrice || "", maxPrice: initial.maxPrice || "", sort: initial.sort || "newest" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  function update(key: keyof typeof values, value: string) { setValues((current) => ({ ...current, [key]: value })); }
  function apply(event: React.FormEvent) { event.preventDefault(); const params = new URLSearchParams(Object.entries(values).filter(([, value]) => value && value !== "newest")); router.push(`/search${params.size ? `?${params}` : ""}`); }
  return <>
    <form className="filter-panel" onSubmit={apply}>
      <button className="filter-mobile-trigger" type="button" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16}/> Filters <span>{filtersOpen ? "−" : "+"}</span></button>
      <div className={`filter-fields ${filtersOpen ? "filters-open" : ""}`}>
        <label>Looking to<select value={values.type} onChange={(e) => update("type", e.target.value)}><option value="">Buy or rent</option><option value="sale">Buy</option><option value="rent">Rent</option></select></label>
        <label>Neighbourhood<select value={values.locality} onChange={(e) => update("locality", e.target.value)}><option value="">All Bengaluru</option>{["Indiranagar", "Koramangala", "Whitefield", "JP Nagar", "Sadashivanagar", "Bellandur"].map((name) => <option key={name}>{name}</option>)}</select></label>
        <label>Bedrooms<select value={values.bedrooms} onChange={(e) => update("bedrooms", e.target.value)}><option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>
        <label>Max. price (₹)<input type="number" min="0" placeholder="No limit" value={values.maxPrice} onChange={(e) => update("maxPrice", e.target.value)}/></label>
        <label>Sort by<select value={values.sort} onChange={(e) => update("sort", e.target.value)}><option value="newest">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
        <button className="filter-submit" type="submit"><Search size={16}/> Show homes</button>
      </div>
    </form>
    <div className="results-meta"><span>{listings.length} homes to explore</span><span>Curated for Bengaluru</span></div>
    {listings.length ? <div className="listing-grid results-grid">{listings.map((listing, index) => <ListingCard key={listing._id} listing={listing} index={index}/>)}</div> : <div className="empty-state"><span className="empty-mark">⌂</span><h2>No homes in this search yet.</h2><p>Try a different neighbourhood or widen your price range.</p><button className="text-link" onClick={() => router.push("/search")}>Clear your filters <span>↗</span></button></div>}
  </>;
}
