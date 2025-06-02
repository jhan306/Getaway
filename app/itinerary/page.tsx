"use client"

import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import ItineraryPlanner from "@/components/itinerary-planner"

export default function ItineraryPage() {
  const params = useSearchParams()
  const countryId = params.get("destination") || "greece"

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        <ItineraryPlanner countryId={countryId} />
      </main>

      <footer className="border-t py-6 md:py-0 bg-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-6xl">🌍</span>
            <p className="text-sm text-muted-foreground">© 2024 Getaway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
