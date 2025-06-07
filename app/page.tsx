import Link from "next/link";
import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section
        className="w-full py-12 md:py-24 lg:py-32"
        style={{ backgroundColor: "#ADD8E6" }}
      >
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white !important">
                  Explore Our World in Detail
                </h1>
                <p className="max-w-[600px] text-white !important md:text-xl">
                  Discover countries, learn about cultures, and plan your next
                  adventure with our interactive tools.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/map">
                  <Button size="lg" variant="outline" className="px-8">
                    Explore the Map
                  </Button>
                </Link>
                <Link href="/my-trips">
                  <Button size="lg" variant="outline" className="px-8">
                    Plan Your Trip
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-75 blur"></div>
                <div className="relative flex items-center justify-center rounded-xl bg-background p-8">
                  <div className="h-48 w-48 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-6xl">🌍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-black">
                Interactive Features
              </h2>
              <p className="max-w-[900px] text-black md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform provides a range of features to help you explore
                the world and plan your travels.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <Search className="h-10 w-10 text-primary" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Country Information</h3>
                  <p className="text-muted-foreground">
                    Click on any country to view detailed information including
                    capital, population, and area.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-10 w-10 text-primary" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Interactive Map</h3>
                  <p className="text-muted-foreground">
                    Explore our interactive world map with data visualizations
                    and country information.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="flex items-start gap-4">
                <Calendar className="h-10 w-10 text-primary" />
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Itinerary Planning</h3>
                  <p className="text-muted-foreground">
                    Plan your trip with our drag-and-drop itinerary builder to
                    create the perfect travel schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-black md:text-4xl/tight">
              Ready to explore the world?
            </h2>
            <p className="max-w-[600px] text-black md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Start your journey of discovery with our interactive tools.
              Explore countries, learn about cultures, and plan your next
              adventure.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-end">
            <Link href="/map">
              <Button size="lg" variant="outline" className="px-8">
                Explore the Map
              </Button>
            </Link>
            <Link href="/itinerary">
              <Button size="lg" variant="outline" className="px-8">
                Plan Your Trip
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-6xl">🌍</span>
            <p className="text-sm text-muted-foreground">
              © 2025 Getaway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
