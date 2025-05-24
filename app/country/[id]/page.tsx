"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Globe, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import ItineraryPlanner from "@/components/itinerary-planner"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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
    questions: [
      {
        id: "q1",
        text: "What's the best time to visit Athens?",
        highlighted: false,
      },
      {
        id: "q2",
        text: "How many days should I spend in Santorini?",
        highlighted: true,
      },
      {
        id: "q3",
        text: "Is it worth visiting Meteora?",
        highlighted: false,
      },
      {
        id: "q4",
        text: "Best restaurants in Athens?",
        highlighted: false,
      },
    ],
  },
  italy: {
    name: "Italy",
    flag: "🇮🇹",
    cities: ["Rome", "Venice", "Florence"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [],
    questions: [],
  },
  japan: {
    name: "Japan",
    flag: "🇯🇵",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [],
    questions: [],
  },
  france: {
    name: "France",
    flag: "🇫🇷",
    cities: ["Paris", "Nice", "Lyon"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    destinations: [],
    questions: [],
  },
}

export default function CountryPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const countryId = params.id
  const country = countryData[countryId as keyof typeof countryData]

  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const { toast } = useToast()

  if (!country) {
    return <div>Country not found</div>
  }

  // Filter destinations based on selected city, sort option, and search query
  const filteredDestinations = country.destinations.filter((destination) => {
    if (selectedCity && destination.city !== selectedCity) {
      return false
    }
    if (selectedSortOption && destination.type !== selectedSortOption) {
      return false
    }
    if (
      searchQuery &&
      !destination.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !destination.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !destination.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  // Filter questions based on search query
  const filteredQuestions = country.questions.filter((question) => {
    if (searchQuery && !question.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Handle posting a new question
  const handlePostQuestion = () => {
    if (!newQuestion.trim()) return

    // Create a new question object
    const newQuestionObj = {
      id: `q${country.questions.length + 1}`,
      text: newQuestion,
      highlighted: false,
    }

    // Add the new question to the beginning of the array
    country.questions.unshift(newQuestionObj)

    // Clear the input
    setNewQuestion("")

    toast({
      title: "Question posted",
      description: "Your question has been added to the community forum.",
    })
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
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Home
            </Link>
            <Link href="/map" className="text-sm font-medium hover:underline underline-offset-4">
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
                          className={`text-left w-full hover:font-medium ${selectedCity === city ? "font-medium" : ""}`}
                          onClick={() => {
                            setSelectedCity(selectedCity === city ? null : city)
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
                          className={`text-left w-full hover:font-medium ${
                            selectedSortOption === option ? "font-medium" : ""
                          }`}
                          onClick={() => {
                            setSelectedSortOption(selectedSortOption === option ? null : option)
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
              <Tabs defaultValue="browse" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger
                    value="browse"
                    className="data-[state=active]:bg-amber-200 data-[state=active]:text-black"
                  >
                    browse
                  </TabsTrigger>
                  <TabsTrigger value="ask" className="data-[state=active]:bg-amber-200 data-[state=active]:text-black">
                    ask
                  </TabsTrigger>
                  <TabsTrigger
                    value="plan-trip"
                    className="data-[state=active]:bg-amber-200 data-[state=active]:text-black"
                  >
                    plan trip
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="mt-0">
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                        onClick={handlePostQuestion}
                        disabled={!newQuestion.trim()}
                      >
                        Post Question
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {filteredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className={`rounded-lg p-4 mb-3 ${question.highlighted ? "bg-gray-500" : "bg-gray-200"}`}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className={`text-lg font-medium ${question.highlighted ? "text-white" : "text-black"}`}>
                              {question.text}
                            </h3>
                            <button
                              className={`rounded-full p-1 ${question.highlighted ? "bg-white" : "bg-gray-300"}`}
                              onClick={() => {
                                question.highlighted = !question.highlighted
                                // Force a re-render
                                setNewQuestion((s) => s + " ")
                                setNewQuestion((s) => s.trim())
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill={question.highlighted ? "currentColor" : "none"}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="plan-trip" className="mt-0">
                  <ItineraryPlanner countryId={countryId} />
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
            <p className="text-sm text-muted-foreground">© 2024 Getaway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
