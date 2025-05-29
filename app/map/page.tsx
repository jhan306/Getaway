import Link from "next/link"
import WorldMap from "@/components/world-map"
import { Globe, ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MapPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold text-white !important">Getaway</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4 text-white !important">
              Home
            </Link>
            <Link href="/map" className="text-sm font-medium underline-offset-4 underline text-white !important">
              Explore Map
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 gap-1 text-white !important">
              <ArrowLeft className="h-4 w-4 text-white !important" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-4 text-white !important">Interactive World Map</h1>
          <p className="text-lg mb-2 max-w-2xl text-white !important">
            asdf Explore countries around the world. Hover over a country to see its name, and click on a country to display
            data.
          </p>
          <div className="flex items-center gap-2 mb-6 text-sm text-white !important">
            <Info className="h-4 w-4 text-white !important" />
            <span>
              Click on countries to toggle data popups. The size of the circle represents the magnitude of the value.
            </span>
          </div>
          <div className="w-full h-[70vh] bg-white rounded-lg shadow-lg p-4">
            <WorldMap />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <p className="text-sm text-white !important">© 2024 Getaway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
