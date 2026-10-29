"use client";

import { useState } from "react";
import type { Listing } from "@estara/shared";
import { submitInquiry } from "@/lib/api";
import { ArrowUpRight, Check } from "lucide-react";

export function InquiryForm({ listing }: { listing: Listing }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus("");
    const form = new FormData(event.currentTarget);
    try {
      await submitInquiry({ listingId: listing._id, name: String(form.get("name")), email: String(form.get("email")), phone: String(form.get("phone")), message: String(form.get("message")) });
      setStatus("Thanks — we’ll be in touch soon."); event.currentTarget.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : "We couldn’t send that just now. Please try again."); }
    finally { setBusy(false); }
  }
  return <form className="inquiry-form" onSubmit={submit}>
    <label>Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Name"/></label>
    <label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></label>
    <label>Phone number<input name="phone" type="tel" required minLength={8} maxLength={25} autoComplete="tel" placeholder="+91"/></label>
    <label>A note, if you like<textarea name="message" required minLength={10} maxLength={2000} rows={3} defaultValue={`I’d love to know more about ${listing.title}.`}/></label>
    <button className="submit-inquiry" type="submit" disabled={busy}>{busy ? "Sending…" : status.includes("Thanks") ? "Sent" : "Send an enquiry"}{status.includes("Thanks") ? <Check size={16}/> : <ArrowUpRight size={16}/>}</button>
    {status && <p className={status.includes("Thanks") ? "form-status form-success" : "form-status form-error"} role="status">{status}</p>}
    <p className="privacy-note">Your details are only shared with our team about this home.</p>
  </form>;
}
