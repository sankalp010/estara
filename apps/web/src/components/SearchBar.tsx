"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, MapPin } from "lucide-react";

export function SearchBar({ compact = false, initialType = "sale" }: { compact?: boolean; initialType?: string }) {
  const [type, setType] = useState(initialType === "rent" ? "rent" : "sale");
  const [locality, setLocality] = useState("");
  const router = useRouter();
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ type });
    if (locality) params.set("locality", locality);
    router.push(`/search?${params.toString()}`);
  }
  return <form className={`search-bar ${compact ? "search-bar-compact" : ""}`} onSubmit={submit}>
    <div className="search-toggle" aria-label="Choose sale or rent"><button type="button" className={type === "sale" ? "selected" : ""} onClick={() => setType("sale")}>Buy</button><button type="button" className={type === "rent" ? "selected" : ""} onClick={() => setType("rent")}>Rent</button></div>
    <label className="search-location"><MapPin size={17}/><span className="sr-only">Neighbourhood</span><select value={locality} onChange={(event) => setLocality(event.target.value)}><option value="">All Bengaluru</option>{["Indiranagar", "Koramangala", "Whitefield", "JP Nagar", "Sadashivanagar", "Bellandur"].map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
    <button className="search-submit" type="submit">Explore homes <ArrowUpRight size={16}/></button>
  </form>;
}
