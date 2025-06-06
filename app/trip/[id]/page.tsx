// app/trip/[id]/page.tsx

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Database } from "@/lib/database.types";
import Header from "@/components/header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// Define activity shape matching your JSON structure
type ActivityJson = {
  id: string;
  name: string;
  type: string;
  image: string;
  isEnd: boolean;
  isStart: boolean;
  duration: string;
  location: string;
  position: number;
  timeRange: string;
  totalSlots: number;
  description: string;
  scenicRating: number;
  culturalRating: number;
  physicalRating: number;
};

// Trip shape including JSON field
type TripWithJson = {
  id: string;
  name: string;
  country_id: string;
  flag: string;
  created_at: string;
  user: { full_name: string | null } | null;
  itinerary_json: unknown; // raw JSON coming from Supabase
};

export default async function TripPage({ params }: { params: { id: string } }) {
  const { id: tripId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });

  // Fetch trip record including the JSON itinerary
  const { data: tripData, error: tripError } = await supabase
    .from("trips")
    .select(
      `
        id,
        name,
        country_id,
        flag,
        created_at,
        itinerary_json,
        user:users_public!trips_user_id_fkey(full_name)
      `
    )
    .eq("id", tripId)
    .single();

  if (tripError || !tripData) {
    console.error("Trip load error:", tripError);
    return notFound();
  }

  // Safely parse itinerary_json if it's a string
  const rawJson = tripData.itinerary_json as ActivityJson | string | null;
  let itineraryJson: {
    available: any[];
    scheduled: Record<string, ActivityJson>;
  } = { available: [], scheduled: {} };
  if (typeof rawJson === "string") {
    try {
      itineraryJson = JSON.parse(rawJson);
    } catch {
      itineraryJson = { available: [], scheduled: {} };
    }
  } else if (rawJson && typeof rawJson === "object") {
    itineraryJson = rawJson as any;
  }

  // Extract scheduled activities from JSON
  const scheduledEntries = itineraryJson.scheduled || {};
  // Convert object to sorted array by key (date-time)
  const scheduledArray = Object.entries(scheduledEntries)
    .map(([key, activity]) => ({ scheduleKey: key, ...activity }))
    .sort((a, b) => (a.scheduleKey > b.scheduleKey ? 1 : -1));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tripData.flag}</span>
              <CardTitle className="text-2xl">{tripData.name}</CardTitle>
            </div>
            <p className="text-sm text-gray-600">
              by {tripData.user?.full_name ?? "Anonymous"} on{" "}
              {new Date(tripData.created_at).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {scheduledArray.length > 0 ? (
                scheduledArray.map((item) => (
                  <div key={item.id}>
                    <h3 className="text-lg font-medium">{item.scheduleKey}</h3>
                    <p className="text-sm text-gray-700">{item.name}</p>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.timeRange}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  No scheduled activities.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
