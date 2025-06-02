import { Info } from "lucide-react"
import WorldMap from "@/components/world-map"
import Header from "@/components/header"

export default function MapPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex flex-col">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <h1 className="text-3xl font-bold mb-4">Interactive World Map</h1>
          <p className="text-lg mb-2 max-w-2xl">
            Explore countries around the world. Hover over a country to see its name, and click on a country to display
            data.
          </p>
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Info className="h-4 w-4" />
            <span>
              Click on countries to toggle data popups. The size of the circle represents the magnitude of the value.
            </span>
          </div>
          <div className="w-full h-[70vh] bg-white rounded-lg shadow-lg p-4">
            <WorldMap />
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-6xl">🌍</span>
            <p className="text-sm text-muted-foreground">© 2024 Getaway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
