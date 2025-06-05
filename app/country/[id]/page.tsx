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
    destinations: [
      {
        id: "colosseum",
        name: "Colosseum",
        image: "/images/colosseum.jpg",
        city: "Rome",
        type: "Landmarks",
      },
      {
        id: "venice-canals",
        name: "Venice Canals",
        image: "/images/venice-canals.jpg",
        city: "Venice",
        type: "Landmarks",
      },
      {
        id: "duomo-florence",
        name: "Florence Cathedral (Duomo)",
        image: "/images/duomo-florence.jpg",
        city: "Florence",
        type: "Landmarks",
      },
      {
        id: "pantheon",
        name: "Pantheon",
        image: "/images/pantheon.jpg",
        city: "Rome",
        type: "Landmarks",
      },
      {
        id: "leaning-tower",
        name: "Leaning Tower of Pisa",
        image: "/images/leaning-tower.jpg",
        city: "Pisa",
        type: "Landmarks",
      },
    ],
  },
  japan: {
    name: "Japan",
    flag: "🇯🇵",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [
      {
        id: "tokyo-tower",
        name: "Tokyo Tower",
        image: "/images/tokyo-tower.jpg",
        city: "Tokyo",
        type: "Landmarks",
      },
      {
        id: "fushimi-inari",
        name: "Fushimi Inari Shrine",
        image: "/images/fushimi-inari.jpg",
        city: "Kyoto",
        type: "Landmarks",
      },
      {
        id: "osaka-castle",
        name: "Osaka Castle",
        image: "/images/osaka-castle.jpg",
        city: "Osaka",
        type: "Landmarks",
      },
      {
        id: "sensoji",
        name: "Senso-ji Temple",
        image: "/images/sensoji.jpg",
        city: "Tokyo",
        type: "Landmarks",
      },
      {
        id: "arashiyama",
        name: "Arashiyama Bamboo Grove",
        image: "/images/arashiyama.jpg",
        city: "Kyoto",
        type: "Landmarks",
      },
    ],
  },
  france: {
    name: "France",
    flag: "🇫🇷",
    cities: ["Paris", "Nice", "Lyon"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [
      {
        id: "eiffel-tower",
        name: "Eiffel Tower",
        image: "/images/eiffel-tower.jpg",
        city: "Paris",
        type: "Landmarks",
      },
      {
        id: "louvre",
        name: "Louvre Museum",
        image: "/images/louvre.jpg",
        city: "Paris",
        type: "Landmarks",
      },
      {
        id: "notre-dame",
        name: "Notre-Dame Cathedral",
        image: "/images/notre-dame.jpg",
        city: "Paris",
        type: "Landmarks",
      },
      {
        id: "promenade-nice",
        name: "Promenade des Anglais",
        image: "/images/promenade-nice.jpg",
        city: "Nice",
        type: "Landmarks",
      },
      {
        id: "basilica-lyon",
        name: "Basilica of Notre-Dame de Fourvière",
        image: "/images/basilica-lyon.jpg",
        city: "Lyon",
        type: "Landmarks",
      },
    ],
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
        user:users_public!user_id (
          id,
          email,
          full_name
        ),
        replies (
          id,
          text,
          created_at,
          user:users_public!user_id (
            id,
            email,
            full_name
          )
        )
      `
      )
      .eq("country_slug", countrySlug)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      throw error;
    }
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

  /* delete a question */
  const deleteQuestion = async (qId: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", qId);
    if (error) {
      toast({
        title: "Could not delete question",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Question deleted",
        variant: "default",
      });
      mutate();
    }
  };

  /* delete a reply */
  const deleteReply = async (replyId: string) => {
    const { error } = await supabase.from("replies").delete().eq("id", replyId);
    if (error) {
      toast({
        title: "Could not delete reply",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reply deleted",
        variant: "default",
      });
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
              <Tabs defaultValue="ask" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger
                    value="ask"
                    className="data-[state=active]:bg-amber-200 data-[state=active]:text-black"
                  >
                    ask
                  </TabsTrigger>
                </TabsList>

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
                                {q.user?.full_name ?? "anon"}
                              </span>
                              <div className="mt-1">{q.text}</div>
                            </div>

                            <div className="flex gap-2 items-center">
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
                              {q.user?.id === currentUser?.id && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => deleteQuestion(q.id)}
                                >
                                  🗑️
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* replies */}
                          <div className="mt-3 space-y-2">
                            {q.replies?.map((r: any) => (
                              <div
                                key={r.id}
                                className="bg-white rounded px-3 py-2 text-sm flex justify-between items-center"
                              >
                                <div>
                                  <strong className="mr-2">
                                    {r.user?.full_name ?? "anon"}
                                  </strong>
                                  <div className="mt-1">{r.text}</div>
                                </div>
                                {r.user?.id === currentUser?.id && (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 ml-2"
                                    onClick={() => deleteReply(r.id)}
                                  >
                                    🗑️
                                  </Button>
                                )}
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
