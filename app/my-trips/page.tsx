// app/my-trips/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import ItineraryPlanner from "@/components/itinerary-planner";

// 1) Remove your old createClient import:
// import { createClient } from "@/lib/supabase/client"

// 2) Add the official Next.js "Pages" helper for Supabase:
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

type Trip = {
  id: string;
  name: string;
  country_id: string;
  flag: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  activities: { count: number }[];
};

export default function MyTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // ─── NEW STATE ────────────────────────────────────────────────────────
  // Which trip ID is currently open in the planner? (null if none)
  const [activePlannerTripId, setActivePlannerTripId] = useState<string | null>(null);

  // The name to pass into ItineraryPlanner so it displays correctly:
  const [plannerInitialName, setPlannerInitialName] = useState<string>("");

  // Whether the planner component should be visible:
  const [showPlanner, setShowPlanner] = useState(false);

  // ─── FETCH ALL TRIPS FOR THE CURRENT USER ──────────────────────────────
  async function fetchMyTrips() {
    if (!user) return;
    const supabase = createPagesBrowserClient();
    const { data, error } = await supabase
      .from("trips")
      .select(
        `
        id,
        name,
        country_id,
        flag,
        is_public,
        created_at,
        updated_at,
        activities(count)
      `
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setTrips(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchMyTrips();
  }, [user]);

  // ─── TOGGLE PUBLIC / PRIVATE ───────────────────────────────────────────
  const togglePublic = async (tripId: string, currentStatus: boolean) => {
    const supabase: SupabaseClient<any> = createPagesBrowserClient();
    const { error } = await supabase
      .from("trips")
      .update({ is_public: !currentStatus })
      .eq("id", tripId);

    if (!error) {
      setTrips((prev) =>
        prev.map((trip) =>
          trip.id === tripId ? { ...trip, is_public: !currentStatus } : trip
        )
      );

      toast({
        title: !currentStatus ? "Trip made public" : "Trip made private",
        description: !currentStatus
          ? "Your trip is now visible to the community"
          : "Your trip is now private",
      });
    }
  };

  // ─── DELETE A TRIP ─────────────────────────────────────────────────────
  const deleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    const supabase: SupabaseClient<any> = createPagesBrowserClient();
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (!error) {
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      toast({
        title: "Trip deleted",
        description: "Your trip has been permanently deleted",
      });
      // If we happen to be viewing this trip in the planner, close it:
      if (activePlannerTripId === tripId) {
        setShowPlanner(false);
        setActivePlannerTripId(null);
        setPlannerInitialName("");
      }
    }
  };

  // ─── ADD A SAMPLE “GREECE” TRIP ─────────────────────────────────────────
  const handleAddSampleTrip = async () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Log in first to add a sample trip.",
        variant: "destructive",
      });
      return;
    }

    const supabase: SupabaseClient<any> = createPagesBrowserClient();
    // Insert a “Sample Greece Trip” into Supabase with is_public = false
    const { data: inserted, error } = await supabase
      .from("trips")
      .insert([
        {
          name: "Sample Greece Trip",
          country_id: "greece",
          flag: "🇬🇷",
          is_public: false,
          user_id: user.id,
        },
      ])
      .select(
        `
        id,
        name,
        country_id,
        flag,
        is_public,
        created_at,
        updated_at,
        activities(count)
      `
      )
      .single();

    if (error || !inserted) {
      toast({
        title: "Failed to add sample trip",
        description: error?.message ?? "Unknown error",
        variant: "destructive",
      });
      return;
    }

    // Prepend into local state so the card shows up immediately
    setTrips((prev) => [inserted, ...prev]);
    toast({
      title: "Sample Greece Trip added",
      description: "A sample trip has been inserted for you to explore.",
    });
  };

  // ─── CREATE A BRAND-NEW BLANK TRIP (opens the planner) ───────────────────
  const handleCreateBlankTrip = async () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "You must be signed in to create a new trip.",
        variant: "destructive",
      });
      return;
    }

    const name = prompt("Give your trip a name (e.g. Spain 2026)")?.trim();
    if (!name) return;

    const supabase: SupabaseClient<any> = createPagesBrowserClient();
    const { data: { user: currentUser }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !currentUser) {
      toast({
        title: "Not signed in",
        description: "You must be signed in to create a trip.",
        variant: "destructive",
      });
      return;
    }

    // Insert the new trip row into Supabase:
    const { data: insertedTrip, error } = await supabase
      .from("trips")
      .insert([
        {
          name: name,
          country_id: "",     // Blank ⇒ planner will show no default country’s activities
          flag: "🗺️",       // Globe emoji (no default country)
          is_public: false,
          user_id: currentUser.id,
        },
      ])
      .select(
        `
        id,
        name,
        country_id,
        flag,
        is_public,
        created_at,
        updated_at,
        activities(count)
      `
      )
      .single();

    if (error || !insertedTrip) {
      toast({
        title: "Failed to create trip",
        description: error?.message ?? "Unknown error",
        variant: "destructive",
      });
      return;
    }

    // 1) Add it to the top of the list immediately
    setTrips((prev) => [insertedTrip, ...prev]);

    // 2) Store its ID & name so the planner can load it:
    setActivePlannerTripId(insertedTrip.id);
    setPlannerInitialName(insertedTrip.name);

    // 3) Show the planner panel:
    setShowPlanner(true);

    toast({
      title: "Trip created (private)",
      description: "You can now schedule activities. Toggle public when ready.",
    });
  };

  // ─── LOADING STATE ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading your trips...</p>
          </div>
        </main>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container px-4 py-8">
        {/* ─── HEADER + BUTTONS ─── */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Trips</h1>
            <p className="text-gray-600">
              Manage your travel plans and itineraries
            </p>
          </div>

          {/* ─── Add Sample / Create Blank ─── */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleAddSampleTrip}>
              Add Sample Trip
            </Button>
            <Button size="sm" onClick={handleCreateBlankTrip}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </div>
        </div>

        {/* ─── TRIP CARDS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{trip.flag}</span>
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    {trip.is_public ? (
                      <Eye className="h-4 w-4 text-green-600" title="Public" />
                    ) : (
                      <EyeOff
                        className="h-4 w-4 text-gray-400"
                        title="Private"
                      />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.activities?.[0]?.count || 0} activities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(trip.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* ─── EDIT: pass trip.id as query param ─── */}
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/itinerary?trip=${trip.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublic(trip.id, trip.is_public)}
                    >
                      {trip.is_public ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTrip(trip.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── “No trips yet” PROMPT ─── */}
        {trips.length === 0 && !showPlanner && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No trips yet</h3>
            <p className="text-gray-600 mb-4">
              Start planning your first adventure!
            </p>
            <Button onClick={() => setShowPlanner(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </div>
        )}

        {/* ─── SHOW PLANNER PANEL ─── */}
        {showPlanner && activePlannerTripId && (
          <div className="mt-8">
            <ItineraryPlanner
              countryId={""}                              // blank → no default country
              initialName={plannerInitialName}
              initialTripId={activePlannerTripId}
            />
          </div>
        )}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-6xl">🌍</span>
            <p className="text-sm text-muted-foreground">
              © 2024 Getaway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
