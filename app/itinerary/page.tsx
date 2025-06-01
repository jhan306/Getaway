// app/itinerary/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import ItineraryPlanner from "@/components/itinerary-planner";

export default function ItineraryPage() {
  const params      = useSearchParams();
  const countryId   = params.get("destination") || "greece";   // optional ?destination=greece
  return <ItineraryPlanner countryId={countryId} />;
}
