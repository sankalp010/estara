import type { Metadata } from "next";
import { getListings } from "@/lib/api";
import { SearchResults } from "@/components/SearchResults";

export const metadata: Metadata = { title: "Explore homes" };
type SearchParams = Promise<{ type?: string; locality?: string; bedrooms?: string; minPrice?: string; maxPrice?: string; sort?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString();
  const listings = await getListings(query ? `?${query}` : "");
  return <main className="page-shell results-page"><div className="section-label"><span>ESTARA / 01</span> BENGALURU, INDIA</div><h1>Find your <em>place.</em></h1><p className="results-intro">A few good homes, in the neighbourhoods you love.</p><SearchResults listings={listings} initial={params}/></main>;
}
