// app/itinerary/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import ItineraryPlanner from "@/components/itinerary-planner";

type TripRecord = {
  id: string;
  name: string;
  country_id: string;
  flag: string;
  // (If you store saved itinerary JSON inside trips, you could fetch that too
  //  e.g. itinerary_json: any,  … )
};

export default function ItineraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // 1) Grab the “trip” query param from the URL
  const tripIdParam = searchParams.get("trip");
  const [loading, setLoading] = useState<boolean>(true);
  const [tripData, setTripData] = useState<TripRecord | null>(null);

  useEffect(() => {
    if (!tripIdParam) {
      toast.toast({
        title: "No trip ID provided",
        description: "Please open an existing trip from My Trips.",
        variant: "destructive",
      });
      return;
    }

    // 2) Fetch that trip’s row from Supabase
    async function fetchTrip() {
      setLoading(true);
      const supabase: SupabaseClient<any> = createPagesBrowserClient();
      const { data, error } = await supabase
        .from("trips")
        .select("id, name, country_id, flag")
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
  }, [tripIdParam, toast]);

  // 3) Render a loading spinner while fetching
  if (loading || !tripIdParam) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 4) If we couldn’t fetch a trip (tripData === null), show an error
  if (!tripData) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-red-600">Trip not found.</p>
          <button
            onClick={() => router.push("/my-trips")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Go back to My Trips
          </button>
        </div>
      </div>
    );
  }

  // 5) Finally, render ItineraryPlanner, passing in:
  //    • countryId = the trip’s country_id
  //    • initialName = the trip’s name
  //    • initialTripId = the trip’s ID (so the planner can load+save itinerary)
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-6 border-b">
        <h1 className="text-2xl font-bold">Itinerary for {tripData.name}</h1>
      </header>
      <main className="flex-1 px-6 py-8">
        <ItineraryPlanner
          countryId={tripData.country_id}
          initialName={tripData.name}
          initialTripId={tripData.id}
        />
      </main>
    </div>
  );
}
