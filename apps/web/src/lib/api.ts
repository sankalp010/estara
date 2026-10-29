import type { InquiryInput, Listing } from "@estara/shared";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const fallbackImages = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",
];

export const sampleListings: Listing[] = [
  { _id: "demo-indiranagar", slug: "quiet-light-indiranagar", title: "Quiet light in Indiranagar", type: "sale", propertyType: "apartment", price: 28500000, currency: "INR", bedrooms: 3, bathrooms: 3, areaSqft: 1860, address: { locality: "Indiranagar", city: "Bengaluru", state: "Karnataka" }, description: "A considered home tucked between the cafés and tree-lined lanes of Indiranagar. Wide windows bring the morning in, while a generous living room makes space for unhurried evenings.", features: ["East-facing", "Covered parking", "Lift", "Balcony", "24/7 security"], images: [fallbackImages[0], fallbackImages[2]], status: "published", featured: true },
  { _id: "demo-whitefield", slug: "garden-house-whitefield", title: "A garden house in Whitefield", type: "sale", propertyType: "villa", price: 46500000, currency: "INR", bedrooms: 4, bathrooms: 4, areaSqft: 2780, address: { locality: "Whitefield", city: "Bengaluru", state: "Karnataka" }, description: "Room to grow, with a private garden that makes the outdoors part of everyday life. Thoughtful proportions, quiet corners, and a welcoming kitchen anchor this independent villa.", features: ["Private garden", "Solar hot water", "Two-car parking", "Clubhouse", "Gated community"], images: [fallbackImages[1], fallbackImages[2]], status: "published", featured: true },
  { _id: "demo-jp-nagar", slug: "sunlit-corner-jp-nagar", title: "A sunlit corner in JP Nagar", type: "rent", propertyType: "apartment", price: 68000, currency: "INR", pricePeriod: "month", bedrooms: 2, bathrooms: 2, areaSqft: 1420, address: { locality: "JP Nagar", city: "Bengaluru", state: "Karnataka" }, description: "A bright, calm apartment with a deep balcony and room for a proper dining table. Set on a leafy residential street close to parks, shops, and the metro.", features: ["Furnished", "Balcony", "Pet friendly", "Metro nearby", "Power backup"], images: [fallbackImages[2], fallbackImages[0]], status: "published", featured: false },
  { _id: "demo-koramangala", slug: "courtyard-home-koramangala", title: "A courtyard home in Koramangala", type: "sale", propertyType: "townhouse", price: 39200000, currency: "INR", bedrooms: 3, bathrooms: 3, areaSqft: 2210, address: { locality: "Koramangala", city: "Bengaluru", state: "Karnataka" }, description: "An easygoing townhouse arranged around a small private courtyard. Warm materials and a quiet palette give the home a feeling that is both open and grounded.", features: ["Private courtyard", "Study nook", "Covered parking", "Community garden", "Solar panels"], images: [fallbackImages[1], fallbackImages[0]], status: "published", featured: true },
  { _id: "demo-sadashivanagar", slug: "old-trees-sadashivanagar", title: "Under the old trees, Sadashivanagar", type: "rent", propertyType: "villa", price: 145000, currency: "INR", pricePeriod: "month", bedrooms: 4, bathrooms: 4, areaSqft: 3200, address: { locality: "Sadashivanagar", city: "Bengaluru", state: "Karnataka" }, description: "A rare independent home in one of Bengaluru's most peaceful pockets. High ceilings, a leafy garden, and slow mornings under a canopy of old trees.", features: ["Independent home", "Private garden", "Staff quarters", "Quiet street", "Carport"], images: [fallbackImages[1], fallbackImages[2]], status: "published", featured: false },
  { _id: "demo-bellandur", slug: "open-sky-bellandur", title: "Open sky in Bellandur", type: "rent", propertyType: "apartment", price: 52000, currency: "INR", pricePeriod: "month", bedrooms: 2, bathrooms: 2, areaSqft: 1280, address: { locality: "Bellandur", city: "Bengaluru", state: "Karnataka" }, description: "A well-planned apartment with open views and a generous balcony. A practical, light-filled base with easy access to the Outer Ring Road and nearby lakes.", features: ["Balcony", "Gym", "Swimming pool", "Power backup", "Visitor parking"], images: [fallbackImages[0], fallbackImages[2]], status: "published", featured: false },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...init?.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Something went wrong");
  return result.data as T;
}

export async function getListings(query = ""): Promise<Listing[]> {
  try { return await request<Listing[]>(`/api/listings${query}`); }
  catch {
    const params = new URLSearchParams(query);
    return sampleListings.filter((item) => (!params.get("type") || item.type === params.get("type")) && (!params.get("locality") || item.address.locality === params.get("locality")) && (!params.get("bedrooms") || item.bedrooms >= Number(params.get("bedrooms"))) && (!params.get("maxPrice") || item.price <= Number(params.get("maxPrice"))))
      .sort((a, b) => params.get("sort") === "price-asc" ? a.price - b.price : params.get("sort") === "price-desc" ? b.price - a.price : 0);
  }
}

export async function getListing(slug: string): Promise<Listing | null> {
  try { return await request<Listing>(`/api/listings/${slug}`); }
  catch { return sampleListings.find((item) => item.slug === slug) || null; }
}

export async function submitInquiry(input: InquiryInput) { return request<{ received: boolean }>("/api/inquiries", { method: "POST", body: JSON.stringify(input) }); }
export async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> { return request<T>(path, init); }

export function formatPrice(listing: Pick<Listing, "price" | "type" | "pricePeriod">) {
  const value = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(listing.price);
  return listing.type === "rent" ? `${value} / month` : value;
}
