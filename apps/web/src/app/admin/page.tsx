import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";
export const metadata: Metadata = { title: "Admin" };
export default function AdminPage() { return <main className="admin-page page-shell"><div className="section-label"><span>ESTARA / ADMIN</span> PRIVATE WORKSPACE</div><AdminPanel/></main>; }
