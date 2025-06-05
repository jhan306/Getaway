"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import ReadOnlyItinerary from "@/components/read-only-itinerary";

export default function TripPage() {
  const params = useParams();
  const tripId = params?.id;
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(
          `
          id,
          name,
          flag,
          available,
          scheduled,
          created_at,
          user:users_public!user_id (
            full_name
          )
        `
        )
        .eq("id", tripId)
        .single();
      if (!error && data) {
        setTrip(data);
        setUser(data.user);
      }
      setLoading(false);
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Loading Trip...</h1>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Trip Not Found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span>{trip.flag}</span>
          {trip.name}
        </h1>
        <p className="text-gray-600 mb-4">
          by {user?.full_name || "Anonymous"}
        </p>
        <ReadOnlyItinerary trip={trip} />
      </div>
    </div>
  );
}
