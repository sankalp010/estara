import crypto from "node:crypto";
import path from "node:path";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";
import { z } from "zod";
import type { Inquiry, Listing, ListingFilters } from "@estara/shared";
import { demoListings } from "./data";
import { InquiryModel, ListingModel } from "./models";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = Number(process.env.PORT || 4000);
const webOrigin = process.env.WEB_ORIGIN || "http://localhost:3000";
const hasDatabase = Boolean(process.env.MONGODB_URI);
const hasAdmin = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
const adminPasswordHash = process.env.ADMIN_PASSWORD ? bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12) : "";
const memoryListings: Listing[] = demoListings.map((listing) => ({ ...listing, images: [...listing.images], features: [...listing.features] }));
const memoryInquiries: Inquiry[] = [];

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: webOrigin.split(",").map((origin) => origin.trim()), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-8", legacyHeaders: false }));
app.use("/api/inquiries", rateLimit({ windowMs: 60 * 60 * 1000, limit: 12, standardHeaders: "draft-8", legacyHeaders: false }));

const listingInput = z.object({
  slug: z.string().trim().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(5).max(120), type: z.enum(["sale", "rent"]), propertyType: z.enum(["apartment", "villa", "townhouse"]),
  price: z.number().int().positive(), pricePeriod: z.enum(["month"]).optional(), bedrooms: z.number().int().min(0).max(20), bathrooms: z.number().int().min(0).max(20), areaSqft: z.number().int().positive(),
  address: z.object({ locality: z.string().trim().min(2), city: z.string().trim().default("Bengaluru"), state: z.string().trim().default("Karnataka"), pincode: z.string().optional() }),
  description: z.string().trim().min(20).max(5000), features: z.array(z.string().trim().min(1).max(80)).max(30).default([]), images: z.array(z.string().url()).max(20).default([]),
  status: z.enum(["draft", "published"]).default("draft"), featured: z.boolean().default(false),
});
const inquiryInput = z.object({ listingId: z.string().min(1), name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254), phone: z.string().trim().min(8).max(25), message: z.string().trim().min(10).max(2000) });

function safeListing(item: Record<string, unknown>): Listing {
  return { ...item, _id: String(item._id) } as unknown as Listing;
}

function asError(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => handler(req, res).catch(next);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.estara_admin || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token || !process.env.SESSION_SECRET) return res.status(401).json({ error: "Admin sign-in required" });
  try {
    jwt.verify(token, process.env.SESSION_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Sign in again." });
  }
}

app.get("/api/health", (_req, res) => res.json({ data: { status: "ok", database: hasDatabase && mongoose.connection.readyState === 1 ? "connected" : "demo" } }));

app.get("/api/listings", asyncRoute(async (req, res) => {
  const filters: ListingFilters = {
    type: req.query.type === "sale" || req.query.type === "rent" ? req.query.type : undefined,
    locality: typeof req.query.locality === "string" ? req.query.locality : undefined,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
    sort: req.query.sort === "price-asc" || req.query.sort === "price-desc" ? req.query.sort : "newest",
  };
  let listings: Listing[];
  if (mongoose.connection.readyState === 1) {
    const query: Record<string, unknown> = { status: "published" };
    if (filters.type) query.type = filters.type;
    if (filters.locality) query["address.locality"] = filters.locality;
    if (filters.bedrooms) query.bedrooms = { $gte: filters.bedrooms };
    if (filters.minPrice || filters.maxPrice) query.price = { ...(filters.minPrice ? { $gte: filters.minPrice } : {}), ...(filters.maxPrice ? { $lte: filters.maxPrice } : {}) };
    const sort: Record<string, 1 | -1> = filters.sort === "price-asc" ? { price: 1 } : filters.sort === "price-desc" ? { price: -1 } : { createdAt: -1 };
    listings = (await ListingModel.find(query).sort(sort).limit(100).lean()).map(safeListing);
  } else {
    listings = memoryListings.filter((listing) => listing.status === "published")
      .filter((listing) => !filters.type || listing.type === filters.type)
      .filter((listing) => !filters.locality || listing.address.locality === filters.locality)
      .filter((listing) => !filters.bedrooms || listing.bedrooms >= filters.bedrooms)
      .filter((listing) => !filters.minPrice || listing.price >= filters.minPrice)
      .filter((listing) => !filters.maxPrice || listing.price <= filters.maxPrice);
    if (filters.sort === "price-asc") listings.sort((a, b) => a.price - b.price);
    if (filters.sort === "price-desc") listings.sort((a, b) => b.price - a.price);
  }
  res.json({ data: listings });
}));

app.get("/api/listings/:slug", asyncRoute(async (req, res) => {
  const listing = mongoose.connection.readyState === 1
    ? await ListingModel.findOne({ slug: req.params.slug, status: "published" }).lean()
    : memoryListings.find((item) => item.slug === req.params.slug && item.status === "published");
  if (!listing) { res.status(404).json({ error: "We couldn't find that home." }); return; }
  res.json({ data: safeListing(listing as unknown as Record<string, unknown>) });
}));

app.post("/api/inquiries", asyncRoute(async (req, res) => {
  const parsed = inquiryInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message || "Please check your details." }); return; }
  const listing = mongoose.connection.readyState === 1
    ? await ListingModel.findById(parsed.data.listingId).lean()
    : memoryListings.find((item) => item._id === parsed.data.listingId);
  if (!listing || ("status" in listing && listing.status !== "published")) { res.status(404).json({ error: "This home is no longer available." }); return; }
  const listingTitle = (listing as unknown as { title: string }).title;
  if (mongoose.connection.readyState === 1) await InquiryModel.create({ ...parsed.data, listingTitle });
  else memoryInquiries.unshift({ ...parsed.data, listingTitle, _id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: "new" });
  if (process.env.RESEND_API_KEY && process.env.INQUIRY_TO_EMAIL && process.env.EMAIL_FROM) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try { await resend.emails.send({ from: process.env.EMAIL_FROM, to: process.env.INQUIRY_TO_EMAIL, replyTo: parsed.data.email, subject: `New Estara enquiry · ${listingTitle}`, text: `${parsed.data.name} (${parsed.data.email} · ${parsed.data.phone}) is interested in ${listingTitle}.\n\n${parsed.data.message}` }); }
    catch (error) { console.error("Inquiry was saved but its email notification failed:", asError(error)); }
  }
  res.status(201).json({ data: { received: true } });
}));

app.post("/api/auth/login", asyncRoute(async (req, res) => {
  if (!hasAdmin) { res.status(503).json({ error: "Admin access is not configured on this server." }); return; }
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const expectedEmail = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const validEmail = email === expectedEmail;
  const validPassword = adminPasswordHash ? await bcrypt.compare(password, adminPasswordHash) : false;
  if (!validEmail || !validPassword) { res.status(401).json({ error: "Email or password is incorrect." }); return; }
  const token = jwt.sign({ sub: expectedEmail, role: "admin" }, process.env.SESSION_SECRET!, { expiresIn: "12h" });
  res.cookie("estara_admin", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 12 * 60 * 60 * 1000, path: "/" });
  res.json({ data: { email: expectedEmail } });
}));

app.post("/api/auth/logout", (_req, res) => { res.clearCookie("estara_admin", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" }); res.json({ data: { loggedOut: true } }); });
app.get("/api/auth/session", requireAdmin, (req, res) => res.json({ data: { authenticated: true, email: process.env.ADMIN_EMAIL } }));

app.get("/api/admin/listings", requireAdmin, asyncRoute(async (_req, res) => {
  const listings = mongoose.connection.readyState === 1 ? (await ListingModel.find().sort({ createdAt: -1 }).lean()).map(safeListing) : memoryListings;
  res.json({ data: listings });
}));

app.post("/api/admin/listings", requireAdmin, asyncRoute(async (req, res) => {
  const parsed = listingInput.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message || "Please check the listing fields." }); return; }
  if (mongoose.connection.readyState === 1) {
    const created = await ListingModel.create(parsed.data);
    res.status(201).json({ data: safeListing(created.toObject()) });
    return;
  }
  const created: Listing = { ...parsed.data, _id: crypto.randomUUID(), currency: "INR" };
  memoryListings.unshift(created);
  res.status(201).json({ data: created });
}));

app.put("/api/admin/listings/:id", requireAdmin, asyncRoute(async (req, res) => {
  const parsed = listingInput.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message || "Please check the listing fields." }); return; }
  if (mongoose.connection.readyState !== 1) {
    const index = memoryListings.findIndex((item) => item._id === req.params.id);
    if (index < 0) { res.status(404).json({ error: "Listing not found." }); return; }
    memoryListings[index] = { ...memoryListings[index], ...parsed.data, address: { ...memoryListings[index].address, ...parsed.data.address } };
    res.json({ data: memoryListings[index] });
    return;
  }
  const updated = await ListingModel.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true }).lean();
  if (!updated) { res.status(404).json({ error: "Listing not found." }); return; }
  res.json({ data: safeListing(updated as unknown as Record<string, unknown>) });
}));

app.delete("/api/admin/listings/:id", requireAdmin, asyncRoute(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const index = memoryListings.findIndex((item) => item._id === req.params.id);
    if (index < 0) { res.status(404).json({ error: "Listing not found." }); return; }
    memoryListings.splice(index, 1);
    res.json({ data: { deleted: true } });
    return;
  }
  const removed = await ListingModel.findByIdAndDelete(req.params.id);
  if (!removed) { res.status(404).json({ error: "Listing not found." }); return; }
  res.json({ data: { deleted: true } });
}));

app.get("/api/admin/inquiries", requireAdmin, asyncRoute(async (_req, res) => {
  if (mongoose.connection.readyState !== 1) { res.json({ data: memoryInquiries }); return; }
  const inquiries = await InquiryModel.find().sort({ createdAt: -1 }).limit(250).lean();
  res.json({ data: inquiries.map((item) => ({ ...item, _id: String(item._id), createdAt: item.createdAt?.toISOString?.() || new Date().toISOString() })) });
}));

app.patch("/api/admin/inquiries/:id", requireAdmin, asyncRoute(async (req, res) => {
  const status = z.enum(["new", "contacted", "closed"]).safeParse(req.body?.status);
  if (!status.success) { res.status(400).json({ error: "Choose a valid inquiry status." }); return; }
  if (mongoose.connection.readyState !== 1) {
    const item = memoryInquiries.find((lead) => lead._id === req.params.id);
    if (!item) { res.status(404).json({ error: "Inquiry not found." }); return; }
    item.status = status.data;
    res.json({ data: item });
    return;
  }
  const item = await InquiryModel.findByIdAndUpdate(req.params.id, { status: status.data }, { new: true }).lean();
  if (!item) { res.status(404).json({ error: "Inquiry not found." }); return; }
  res.json({ data: item });
}));

app.post("/api/admin/uploads/signature", requireAdmin, (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) { return res.status(503).json({ error: "Photo uploads are not configured. Add Cloudinary credentials." }); }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "estara/listings";
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
  res.json({ data: { timestamp, folder, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY } });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err && typeof err === "object" && "code" in err && err.code === 11000) return res.status(409).json({ error: "That listing slug is already in use." });
  const requestId = crypto.randomUUID();
  console.error(`[${requestId}]`, err);
  res.status(500).json({ error: "Something went wrong. Please try again.", requestId });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try { await mongoose.connect(process.env.MONGODB_URI); console.log("Connected to MongoDB"); }
    catch (error) { console.error("MongoDB connection failed; serving demo listings only:", asError(error)); }
  }
  app.listen(port, () => console.log(`Estara API listening on http://localhost:${port}`));
}

start();
