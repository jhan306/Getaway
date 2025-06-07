"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Country data
const countryData = {
  greece: {
    name: "Greece",
    flag: "🇬🇷",
    cities: ["Athens", "Patras", "Volos"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [
      {
        id: "parthenon",
        name: "Parthenon",
        image: "/images/parthenon.jpg", // Update this path to your actual image
        city: "Athens",
        type: "Landmarks",
      },
      {
        id: "corfu",
        name: "Corfu",
        image: "/images/corfu.jpg", // Update this path to your actual image
        city: "Corfu",
        type: "Landmarks",
      },
      {
        id: "meteora",
        name: "Meteora",
        image: "/images/meteora.jpg", // Update this path to your actual image
        city: "Meteora",
        type: "Landmarks",
      },
      {
        id: "santorini",
        name: "Santorini",
        image: "/images/santorini.jpg", // Update this path to your actual image
        city: "Santorini",
        type: "Landmarks",
      },
      {
        id: "acropolis-museum",
        name: "Acropolis Museum",
        image: "/images/acropolis-museum.jpg", // Update this path to your actual image
        city: "Athens",
        type: "Landmarks",
      },
      {
        id: "mykonos",
        name: "Mykonos",
        image: "/images/mykonos.jpg", // Update this path to your actual image
        city: "Mykonos",
        type: "Landmarks",
      },
    ],
  },
  italy: {
    name: "Italy",
    flag: "🇮🇹",
    cities: ["Rome", "Venice", "Florence"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [],
  },
  japan: {
    name: "Japan",
    flag: "🇯🇵",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [],
  },
  france: {
    name: "France",
    flag: "🇫🇷",
    cities: ["Paris", "Nice", "Lyon"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [],
  },
};

export default function BrowsePage({ params }: { params: { id: string } }) {
  const countryId = params.id;
  const country = countryData[countryId as keyof typeof countryData];

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (!country) {
    return <div>Country not found</div>;
  }

  // Filter destinations based on selected city and sort option
  const filteredDestinations = country.destinations.filter((destination) => {
    if (selectedCity && destination.city !== selectedCity) {
      return false;
    }
    if (selectedSortOption && destination.type !== selectedSortOption) {
      return false;
    }
    if (
      searchQuery &&
      !destination.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">Getaway</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Explore Map
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        <Link href={`/country/${countryId}`}>
          <Button variant="ghost" size="sm" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to {country.name}
          </Button>
        </Link>

        <div className="flex flex-col space-y-6">
          {/* Country Header */}
          <div className="flex items-center gap-4">
            <div className="text-4xl">{country.flag}</div>
            <h1 className="text-4xl font-bold">{country.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {/* Left Sidebar */}
            <div className="bg-gray-200 rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold mb-3">CITIES</h2>
                  <ul className="space-y-2">
                    {country.cities.map((city) => (
                      <li key={city}>
                        <button
                          className={`text-left w-full hover:font-medium text-black ${
                            selectedCity === city ? "font-medium" : ""
                          }`}
                          onClick={() => {
                            setSelectedCity(
                              selectedCity === city ? null : city
                            );
                          }}
                        >
                          {city}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <h2 className="font-bold mb-3">SORT BY</h2>
                  <ul className="space-y-2">
                    {country.sortOptions.map((option) => (
                      <li key={option}>
                        <button
                          className={`text-left w-full hover:font-medium text-black ${
                            selectedSortOption === option ? "font-medium" : ""
                          }`}
                          onClick={() => {
                            setSelectedSortOption(
                              selectedSortOption === option ? null : option
                            );
                          }}
                        >
                          {option}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Link
                    href={`/country/${countryId}`}
                    className="px-6 py-2 rounded-full bg-amber-200 text-black"
                  >
                    browse
                  </Link>
                  <Link
                    href={`/country/${countryId}/ask`}
                    className="px-6 py-2 rounded-full bg-gray-300 text-black"
                  >
                    ask
                  </Link>
                  <Link
                    href={`/itinerary?destination=${countryId}`}
                    className="px-6 py-2 rounded-full bg-gray-300 text-black"
                  >
                    plan trip
                  </Link>
                </div>
              </div>

              <div className="relative mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  type="search"
                  placeholder="SEARCH"
                  className="pl-10 bg-gray-200 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredDestinations.map((destination) => (
                  <div key={destination.id} className="relative group">
                    <div className="relative h-48 w-full overflow-hidden rounded-md">
                      <Image
                        src={destination.image || "/placeholder.svg"}
                        alt={destination.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-black p-2 text-center">
                      {destination.name}
                    </div>
                    <button className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0 bg-white">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">
              © 2025 Getaway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
