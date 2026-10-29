import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Header } from "@/components/Header";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = { title: { default: "Estara — Find your place in Bengaluru", template: "%s — Estara" }, description: "Thoughtfully chosen homes for sale and rent across Bengaluru." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body className={`${sans.variable} ${serif.variable}`}><Header/>{children}<footer className="site-footer"><Link className="wordmark" href="/"><span className="wordmark-icon">e</span>estara<span className="wordmark-period">.</span></Link><span className="footer-tagline">Homes with a little more feeling.</span><div className="footer-meta"><span>© {new Date().getFullYear()} Estara</span><span className="footer-credit">Built with <Heart aria-hidden="true" size={12} strokeWidth={1.8} /> by sankalP</span></div></footer></body></html>;
}
