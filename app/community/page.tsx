"use client";

import useSWR from "swr";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { MapPin, Users, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";

type PublicTrip = {
  id: string;
  name: string;
  country_id: string;
  flag: string;
  created_at: string;
  user: {
    full_name: string | null;
    email: string;
  };
  _count: {
    activities: number;
  };
};

export default function CommunityPage() {
  // 1) Instantiate Supabase client for the browser
  const supabase: SupabaseClient<any> = createPagesBrowserClient();

  // 2) Define a fetcher that queries Supabase and returns PublicTrip[]
  const fetchPublicTrips = async (): Promise<PublicTrip[]> => {
    const { data, error } = await supabase
      .from("trips")
      .select(
        `
          id,
          name,
          country_id,
          flag,
          created_at,
          activities(count),
          user:users_public!user_id (
            full_name,
            email
          )
        `
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      throw error;
    }

    // Shape the raw data into PublicTrip[]
    const shaped: PublicTrip[] = (data ?? []).map((trip) => ({
      id: trip.id,
      name: trip.name,
      country_id: trip.country_id,
      flag: trip.flag,
      created_at: trip.created_at,
      user: {
        full_name: trip.user?.full_name ?? "Anonymous",
        email: trip.user?.email ?? "",
      },
      _count: {
        activities: trip.activities?.[0]?.count ?? 0,
      },
    }));

    return shaped;
  };

  // 3) Use SWR to fetch the trips
  const {
    data: trips = [],
    error,
    isLoading,
  } = useSWR<PublicTrip[]>("publicTrips", fetchPublicTrips);

  // 4) Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading community trips...</p>
          </div>
        </main>
      </div>
    );
  }

  // 5) Handle error state (optional, but recommended)
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Failed to load community trips.</p>
          </div>
        </main>
      </div>
    );
  }

  // 6) Render the list of trips (or empty state)
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Trips</h1>
          <p className="text-gray-600">
            Discover amazing trips planned by fellow travelers around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{trip.flag}</span>
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  by {trip.user.full_name || "Anonymous"}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trip._count.activities} activities</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(trip.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/trip/${trip.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Trip
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No public trips yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your travel plans with the community!
            </p>
            <Button asChild>
              <Link href="/itinerary">Create Your First Trip</Link>
            </Button>
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
