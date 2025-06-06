// app/community/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Users, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";

// 1) Import Next.js Supabase helper:
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

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
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase: SupabaseClient<any> = createPagesBrowserClient();

    async function fetchPublicTrips() {
      // 2) Select from “trips” and join against users_public via user_id:
      const { data, error } = await supabase
        .from("trips")
        .select(`
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
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!error && data) {
        // 3) No need to “mock” – use the joined user.full_name directly
        const shaped: PublicTrip[] = data.map((trip) => ({
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
        setTrips(shaped);
      }

      setLoading(false);
    }

    fetchPublicTrips();
  }, []);

  if (loading) {
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
              <CardHeader className="
