import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";
export const metadata: Metadata = { title: "Dashboard" };
export default function DashboardPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="page-heading">
        <p className="eyebrow">Activity reporting</p>
        <h1>Dashboard</h1>
        <p>Monitor stored content, generated activities and builder usage.</p>
      </div>
      <Dashboard />
    </main>
  );
}
