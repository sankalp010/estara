import mongoose, { Schema } from "mongoose";

const listingSchema = new Schema({
  slug: { type: String, required: true, unique: true, index: true }, title: { type: String, required: true },
  type: { type: String, enum: ["sale", "rent"], required: true }, propertyType: { type: String, enum: ["apartment", "villa", "townhouse"], required: true },
  price: { type: Number, required: true, min: 1 }, currency: { type: String, default: "INR" }, pricePeriod: { type: String, enum: ["month"] },
  bedrooms: { type: Number, required: true, min: 0 }, bathrooms: { type: Number, required: true, min: 0 }, areaSqft: { type: Number, required: true, min: 1 },
  address: { locality: { type: String, required: true }, city: { type: String, default: "Bengaluru" }, state: { type: String, default: "Karnataka" }, pincode: String },
  description: { type: String, required: true }, features: [String], images: [String], status: { type: String, enum: ["draft", "published"], default: "draft" }, featured: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });
listingSchema.index({ "address.city": 1, "address.locality": 1, type: 1, status: 1 });

const inquirySchema = new Schema({
  listingId: { type: String, required: true, index: true }, listingTitle: { type: String, required: true },
  name: { type: String, required: true }, email: { type: String, required: true }, phone: { type: String, required: true }, message: { type: String, required: true },
  status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
}, { timestamps: true, versionKey: false });

export const ListingModel = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
export const InquiryModel = mongoose.models.Inquiry || mongoose.model("Inquiry", inquirySchema);
