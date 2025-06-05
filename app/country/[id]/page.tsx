"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Globe, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

// Country data (static fallback for things like flag, cities, etc.)
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
        image: "/images/parthenon.jpg",
        city: "Athens",
        type: "Landmarks",
      },
      {
        id: "corfu",
        name: "Corfu",
        image: "/images/corfu.jpg",
        city: "Corfu",
        type: "Landmarks",
      },
      {
        id: "meteora",
        name: "Meteora",
        image: "/images/meteora.jpg",
        city: "Meteora",
        type: "Landmarks",
      },
      {
        id: "santorini",
        name: "Santorini",
        image: "/images/santorini.jpg",
        city: "Santorini",
        type: "Landmarks",
      },
      {
        id: "acropolis-museum",
        name: "Acropolis Museum",
        image: "/images/acropolis-museum.jpg",
        city: "Athens",
        type: "Landmarks",
      },
      {
        id: "mykonos",
        name: "Mykonos",
        image: "/images/mykonos.jpg",
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

export default function CountryPage({ params }: { params: { id: string } }) {
  const countrySlug = params.id;
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Grab the session's user once on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user ? { id: user.id } : null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({ id: session.user.id });
      } else {
        setCurrentUser(null);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const countryId = params.id;
  const country = countryData[countryId as keyof typeof countryData];

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const { toast } = useToast();

  if (!country) {
    return <div>Country not found</div>;
  }

  // Only use .filter on destinations array that is guaranteed to exist.
  const filteredDestinations = country.destinations.filter((dest) => {
    if (selectedCity && dest.city !== selectedCity) return false;
    if (selectedSortOption && dest.type !== selectedSortOption) return false;
    if (
      searchQuery &&
      !dest.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !dest.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !dest.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // fetch questions + replies from Supabase via SWR
  const {
    data: questions,
    error,
    isLoading,
    mutate,
  } = useSWR(["questions", countrySlug], async () => {
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
          id,
          text,
          highlighted,
          created_at,
          user:auth.users!questions_user_id_fkey (
            id,
            email,
            user_metadata
          ),
          replies (
            id,
            text,
            created_at,
            user:auth.users!replies_user_id_fkey (
              id,
              email
            )
          )
        `
      )
      .eq("country_slug", countrySlug)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

  /* post a new question */
  const postQuestion = async () => {
    if (!newQuestion.trim() || !currentUser) return; // refuse if no user is signed in

    const { data, error } = await supabase.from("questions").insert({
      country_slug: countrySlug,
      user_id: currentUser.id, // ← include the logged‐in user's ID
      text: newQuestion.trim(),
      highlighted: false,
    });

    if (error) {
      console.error("Error inserting question:", error);
      toast({
        title: "Could not post question",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Clear the input, then revalidate the SWR cache so the new question shows up
      setNewQuestion("");
      mutate();
    }
  };

  /* post a reply to a question */
  const postReply = async (qId: string) => {
    const draft = replyDrafts[qId]?.trim();
    if (!draft || !currentUser) return;

    const { data, error } = await supabase.from("replies").insert({
      question_id: qId,
      user_id: currentUser.id, // ← include the "user_id" here, too
      text: draft,
    });

    if (error) {
      console.error("Error inserting reply:", error);
      toast({
        title: "Could not post reply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Clear that reply draft and revalidate
      setReplyDrafts((d) => ({ ...d, [qId]: "" }));
      mutate();
    }
  };

  // ⚠️ Here's the guard: don't call .filter on `questions` until it's actually an array.
  const filteredQuestions = Array.isArray(questions)
    ? questions.filter((q: any) =>
        q.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (error) {
    return <div className="p-4 text-red-500">Error loading feed</div>;
  }
  if (isLoading || !questions) {
    return <div className="p-4 text-gray-500">Loading…</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-black">
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
        <Link href="/map">
          <Button variant="ghost" size="sm" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Map
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
                          className={`text-left w-full hover:font-medium ${
                            selectedCity === city ? "font-medium" : ""
                          }`}
                          onClick={() =>
                            setSelectedCity(selectedCity === city ? null : city)
                          }
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
                          className={`text-left w-full hover:font-medium ${
                            selectedSortOption === option ? "font-medium" : ""
                          }`}
                          onClick={() =>
                            setSelectedSortOption(
                              selectedSortOption === option ? null : option
                            )
                          }
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
              <Tabs defaultValue="browse" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger
                    value="browse"
                    className="data-[state=active]:bg-amber-200 data-[state=active]:text-black"
                  >
                    browse
                  </TabsTrigger>
                  <TabsTrigger
                    value="ask"
                    className="data-[state=active]:bg-amber-200 data-[state=active]:text-black"
                  >
                    ask
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="mt-0">
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
                </TabsContent>

                <TabsContent value="ask" className="mt-0">
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

                  <div className="space-y-4">
                    <div className="bg-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium">Question</h3>
                      <Textarea
                        placeholder={`Ask a question about ${country.name}...`}
                        className="mt-2 bg-white"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                      />
                      <Button
                        className="mt-4 bg-amber-200 text-black hover:bg-amber-300"
                        onClick={postQuestion}
                        disabled={!newQuestion.trim()}
                      >
                        Post Question
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {filteredQuestions.map((q: any) => (
                        <div
                          key={q.id}
                          className="rounded-lg p-4 mb-3 bg-gray-200"
                        >
                          {/* question header */}
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium mr-2">
                                {q.user?.user_metadata?.username ?? "anon"}
                              </span>
                              <em className="text-xs text-gray-600">
                                ({q.user?.email ?? "unknown"})
                              </em>
                              <div className="mt-1">{q.text}</div>
                            </div>

                            <button
                              className="rounded-full p-1 bg-gray-300"
                              onClick={async () => {
                                await supabase
                                  .from("questions")
                                  .update({ highlighted: !q.highlighted })
                                  .eq("id", q.id);
                                mutate();
                              }}
                            >
                              {q.highlighted ? "★" : "☆"}
                            </button>
                          </div>

                          {/* replies */}
                          <div className="mt-3 space-y-2">
                            {q.replies.map((r: any) => (
                              <div
                                key={r.id}
                                className="bg-white rounded px-3 py-2 text-sm"
                              >
                                <strong className="mr-2">
                                  {r.user?.user_metadata?.username ?? "anon"}
                                </strong>
                                <span className="text-xs text-gray-600">
                                  ({r.user?.email ?? "unknown"})
                                </span>
                                <div className="mt-1">{r.text}</div>
                              </div>
                            ))}

                            {/* composer */}
                            <textarea
                              rows={2}
                              className="w-full bg-white border rounded p-2 text-sm"
                              placeholder="Write a reply…"
                              value={replyDrafts[q.id] ?? ""}
                              onChange={(e) =>
                                setReplyDrafts((d) => ({
                                  ...d,
                                  [q.id]: e.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              className="mt-1 bg-amber-200 text-black"
                              disabled={!(replyDrafts[q.id] || "").trim()}
                              onClick={() => postReply(q.id)}
                            >
                              Post reply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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
              © 2024 Getaway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
