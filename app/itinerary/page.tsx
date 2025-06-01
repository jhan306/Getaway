// app/itinerary/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";

import ItineraryPlanner from "@/components/itinerary-planner";

export default function ItineraryPage() {
  // Optional /itinerary?destination=greece
  const params    = useSearchParams();
  const countryId = params.get("destination") || "greece";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ---------- Site header ---------- */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">Getaway</span>
          </div>

          <nav className="flex gap-4 sm:gap-6">
            <Link href="/"     className="text-sm font-medium hover:underline underline-offset-4">Home</Link>
            <Link href="/map"  className="text-sm font-medium hover:underline underline-offset-4">Explore&nbsp;Map</Link>
          </nav>
        </div>
      </header>

      {/* ---------- Main content ---------- */}
      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        <ItineraryPlanner countryId={countryId} />
      </main>

      {/* ---------- Site footer ---------- */}
      <footer className="border-t py-6 md:py-0 bg-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">© 2024 Getaway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
