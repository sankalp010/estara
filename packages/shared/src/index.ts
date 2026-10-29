export type ListingStatus = "draft" | "published";
export type ListingType = "sale" | "rent";

export interface Listing {
  _id: string;
  slug: string;
  title: string;
  type: ListingType;
  propertyType: "apartment" | "villa" | "townhouse";
  price: number;
  currency: "INR";
  pricePeriod?: "month";
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  address: { locality: string; city: string; state: string; pincode?: string };
  description: string;
  features: string[];
  images: string[];
  status: ListingStatus;
  featured: boolean;
  createdAt?: string;
}

export interface InquiryInput {
  listingId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface Inquiry extends InquiryInput {
  _id: string;
  listingTitle: string;
  createdAt: string;
  status: "new" | "contacted" | "closed";
}

export interface ListingFilters {
  type?: ListingType;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: "newest" | "price-asc" | "price-desc";
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
