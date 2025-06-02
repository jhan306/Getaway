"use client"

import { useState } from "react"
import Link from "next/link"
import { Globe, ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Country data
const countryData = {
  greece: {
    name: "Greece",
    flag: "🇬🇷",
    cities: ["Athens", "Patras", "Volos"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    questions: [
      {
        id: "q1",
        text: "What's the best time to visit Athens?",
        highlighted: false,
        replies:[]
      },
      {
        id: "q2",
        text: "How many days should I spend in Santorini?",
        highlighted: true,
        replies:[]
      },
      {
        id: "q3",
        text: "Is it worth visiting Meteora?",
        highlighted: false,
        replies:[]
      },
      {
        id: "q4",
        text: "Best restaurants in Athens?",
        highlighted: false,
        replies:[]
      },
    ],
  },
  italy: {
    name: "Italy",
    flag: "🇮🇹",
    cities: ["Rome", "Venice", "Florence"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    questions: [],
  },
  japan: {
    name: "Japan",
    flag: "🇯🇵",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    questions: [],
  },
  france: {
    name: "France",
    flag: "🇫🇷",
    cities: ["Paris", "Nice", "Lyon"],
    sortOptions: ["Restaurants", "Accommodations", "Landmarks"],
    questions: [],
  },
}

export default function AskPage({ params }: { params: { id: string } }) {
  const countryId = params.id
  const country = countryData[countryId as keyof typeof countryData]

  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newQuestion, setNewQuestion] = useState("")
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  if (!country) {
    return <div>Country not found</div>
  }

  // Filter questions based on search query
  const filteredQuestions = country.questions.filter((question) => {
    if (searchQuery && !question.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

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

    // Show confirmation
    alert(`Your question about ${country.name} has been posted!`)
  }
  const handlePostReply = (q: Question) => {
    const draft = replyDrafts[q.id]?.trim();
    if (!draft) return;
  
    q.replies.unshift({ id: `r${q.replies.length + 1}`, text: draft });
    // clear the textarea for this question
    setReplyDrafts((d) => ({ ...d, [q.id]: "" }));
  };
  
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
                          className={`text-left w-full hover:font-medium text-black ${selectedCity === city ? "font-medium" : ""}`}
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
                          className={`text-left w-full hover:font-medium text-black ${
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
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                  <Link href={`/country/${countryId}`} className="px-6 py-2 rounded-full bg-gray-300 text-black">
                    browse
                  </Link>
                  <Link href={`/country/${countryId}/ask`} className="px-6 py-2 rounded-full bg-amber-200 text-black">
                    ask
                  </Link>
                  <Link
                    href={`/country/${countryId}`}
                    className="px-6 py-2 rounded-full bg-gray-300 text-black"
                    onClick={(e) => {
                      e.preventDefault()
                      window.history.pushState({}, "", `/country/${countryId}`)
                      document
                        .querySelector('[value="plan-trip"]')
                        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
                    }}
                  >
                    plan trip
                  </Link>
                </div>
              </div>

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
                  {filteredQuestions.map((q) => (
                    <div
                      key={q.id}
                      className={`rounded-lg p-4 mb-3 ${q.highlighted ? "bg-gray-500" : "bg-gray-200"}`}
                    >
                      {/* QUESTION text + highlight toggle */}
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-black">{q.text}</h3>
                  
                        {/* ⭐ highlight toggle only */}
                        <button
                          className="rounded-full p-1 bg-gray-300"
                          onClick={() => {
                            q.highlighted = !q.highlighted;
                            // force re-render
                            setSearchQuery((s) => s + " ").trim();
                          }}
                        >
                          {q.highlighted ? "★" : "☆"}
                        </button>
                      </div>
                  
                      {/* REPLIES */}
                      <div className="mt-3 space-y-2">
                        {q.replies.map((r) => (
                          <div key={r.id} className="bg-white rounded px-3 py-2 text-sm text-black">
                            {r.text}
                          </div>
                        ))}
                  
                        {/* Reply composer */}
                        <textarea
                          rows={2}
                          placeholder="Write a reply…"
                          className="w-full bg-white border rounded p-2 text-sm"
                          value={replyDrafts[q.id] ?? ""}
                          onChange={(e) =>
                            setReplyDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                          }
                        />
                        <Button
                          size="sm"
                          className="mt-1 bg-amber-200 text-black hover:bg-amber-300"
                          disabled={!(replyDrafts[q.id] || "").trim()}
                          onClick={() => handlePostReply(q as any)}
                        >
                          Post reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
            <p className="text-sm text-muted-foreground">© 2024 Getaway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
