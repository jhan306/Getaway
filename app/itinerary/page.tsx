// app/itinerary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import ItineraryPlanner from "@/components/itinerary-planner";

type TripRecord = {
  id: string;
  name: string;
  country_id: string;
  flag: string;
  itinerary_json: {
    available: any[];
    scheduled: Record<string, any>;
  } | null;
};

export default function ItineraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // 1) Read `?trip=...` from the URL
  const tripIdParam = searchParams.get("trip");

  const [loading, setLoading] = useState<boolean>(true);
  const [tripData, setTripData] = useState<TripRecord | null>(null);

  // 2) If there is no ?trip=…, show an error and stop loading
  useEffect(() => {
    if (!tripIdParam) {
      toast.toast({
        title: "No trip ID provided",
        description: "Please open an existing trip from My Trips.",
        variant: "destructive",
      });
      // We’re done—don’t try to fetch
      setLoading(false);
      return;
    }

    // 3) Otherwise, fetch that trip’s row from Supabase
    async function fetchTrip() {
      setLoading(true);
      const supabase: SupabaseClient<any> = createPagesBrowserClient();

      const { data, error } = await supabase
        .from("trips")
        .select("id, name, country_id, flag, itinerary_json")
        .eq("id", tripIdParam)
        .single();

      if (error || !data) {
        toast.toast({
          title: "Failed to load trip",
          description: error?.message ?? "Unknown error",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setTripData(data);
      setLoading(false);
    }

    fetchTrip();
  }, [tripIdParam]);

  // 4) While loading (or if no tripIdParam), show a spinner
  if (loading || !tripIdParam) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  // 5) If fetch failed (tripData is still null), show a “not found” message
  if (!tripData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-red-600">Trip not found.</p>
          <button
            onClick={() => router.push("/my-trips")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Go back to My Trips
          </button>
        </main>
      </div>
    );
  }

  // 6) Otherwise, render the planner with that trip’s ID + name
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 px-6 py-8">
        <h1 className="text-2xl font-bold">Itinerary for {tripData.name}</h1>
        <div className="mt-6">
          <ItineraryPlanner
            countryId={tripData.country_id}
            initialName={tripData.name}
            initialTripId={tripData.id}
            initialItineraryJSON={tripData.itinerary_json}
          />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex items-center justify-center text-sm text-gray-500">
          © 2024 Getaway. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
