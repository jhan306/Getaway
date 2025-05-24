"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

// URL to a TopoJSON resource for world countries
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

// Countries with itinerary pages
const countriesWithItineraries = [
  { id: "GRC", name: "Greece", destinationId: "greece" },
  { id: "ITA", name: "Italy", destinationId: "italy" },
  { id: "JPN", name: "Japan", destinationId: "japan" },
  { id: "FRA", name: "France", destinationId: "france" },
]

// Sample country data with values for the popups
const countryData: Record<
  string,
  {
    value: number
    capital: string
    population: string
    area: string
    coordinates: [number, number] // [longitude, latitude]
    hasItinerary?: boolean
    destinationId?: string
  }
> = {
  USA: {
    value: 72,
    capital: "Washington, D.C.",
    population: "331 million",
    area: "9.8 million km²",
    coordinates: [-98.5795, 39.8283],
  },
  CAN: {
    value: 34,
    capital: "Ottawa",
    population: "38 million",
    area: "9.98 million km²",
    coordinates: [-106.3468, 56.1304],
  },
  GBR: {
    value: 63,
    capital: "London",
    population: "67 million",
    area: "242,495 km²",
    coordinates: [-3.436, 55.3781],
  },
  FRA: {
    value: 42,
    capital: "Paris",
    population: "67 million",
    area: "551,695 km²",
    coordinates: [2.2137, 46.2276],
    hasItinerary: true,
    destinationId: "france",
  },
  DEU: {
    value: 56,
    capital: "Berlin",
    population: "83 million",
    area: "357,022 km²",
    coordinates: [10.4515, 51.1657],
  },
  JPN: {
    value: 29,
    capital: "Tokyo",
    population: "126 million",
    area: "377,975 km²",
    coordinates: [138.2529, 36.2048],
    hasItinerary: true,
    destinationId: "japan",
  },
  AUS: {
    value: 17,
    capital: "Canberra",
    population: "25 million",
    area: "7.7 million km²",
    coordinates: [133.7751, -25.2744],
  },
  BRA: {
    value: 22,
    capital: "Brasília",
    population: "212 million",
    area: "8.5 million km²",
    coordinates: [-51.9253, -14.235],
  },
  IND: {
    value: 45,
    capital: "New Delhi",
    population: "1.38 billion",
    area: "3.3 million km²",
    coordinates: [78.9629, 20.5937],
  },
  CHN: {
    value: 83,
    capital: "Beijing",
    population: "1.4 billion",
    area: "9.6 million km²",
    coordinates: [104.1954, 35.8617],
  },
  ZAF: {
    value: 19,
    capital: "Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)",
    population: "59 million",
    area: "1.2 million km²",
    coordinates: [22.9375, -30.5595],
  },
  RUS: {
    value: 51,
    capital: "Moscow",
    population: "144 million",
    area: "17.1 million km²",
    coordinates: [105.3188, 61.524],
  },
  MEX: {
    value: 30,
    capital: "Mexico City",
    population: "126 million",
    area: "1.9 million km²",
    coordinates: [-102.5528, 23.6345],
  },
  ARG: {
    value: 15,
    capital: "Buenos Aires",
    population: "45 million",
    area: "2.7 million km²",
    coordinates: [-63.6167, -38.4161],
  },
  EGY: {
    value: 28,
    capital: "Cairo",
    population: "100 million",
    area: "1 million km²",
    coordinates: [30.8025, 26.8206],
  },
  GRC: {
    value: 25,
    capital: "Athens",
    population: "10.7 million",
    area: "131,957 km²",
    coordinates: [21.8243, 39.0742],
    hasItinerary: true,
    destinationId: "greece",
  },
  ITA: {
    value: 38,
    capital: "Rome",
    population: "60.4 million",
    area: "301,340 km²",
    coordinates: [12.5674, 41.8719],
    hasItinerary: true,
    destinationId: "italy",
  },
}

export default function WorldMap() {
  const [tooltipContent, setTooltipContent] = useState("")
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [activeCountries, setActiveCountries] = useState<string[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  function handleZoomIn() {
    if (position.zoom >= 4) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }))
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }))
  }

  function handleMoveEnd(position: any) {
    setPosition(position)
  }

  function handleCountryClick(geo: any) {
    const { ISO_A3, NAME } = geo.properties

    // Check if this country has an itinerary page
    const countryWithItinerary = countriesWithItineraries.find((c) => c.id === ISO_A3)

    if (countryWithItinerary) {
      // Navigate to the country page for this country
      router.push(`/country/${countryWithItinerary.destinationId}`)
    } else {
      // Toggle the country's active state for data visualization
      setActiveCountries((prev) => {
        if (prev.includes(ISO_A3)) {
          return prev.filter((code) => code !== ISO_A3)
        } else {
          return [...prev, ISO_A3]
        }
      })
    }
  }

  // Calculate marker size based on value
  const getMarkerSize = (value: number) => {
    const baseSize = 15
    const scaleFactor = 0.7
    return baseSize + value * scaleFactor
  }

  return (
    <div className="relative h-full" ref={mapRef}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100" onClick={handleZoomIn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-plus"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100" onClick={handleZoomOut}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-minus"
          >
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>

      <TooltipProvider>
        <ComposableMap projection="geoMercator" className="h-full w-full">
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isItineraryCountry = countriesWithItineraries.some((c) => c.id === geo.properties.ISO_A3)

                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          onMouseEnter={() => {
                            const countryName = geo.properties.NAME
                            const hasItinerary = isItineraryCountry ? " (Click to view country page)" : ""
                            setTooltipContent(`${countryName}${hasItinerary}`)
                          }}
                          onMouseLeave={() => {
                            setTooltipContent("")
                          }}
                          onClick={() => handleCountryClick(geo)}
                          style={{
                            default: {
                              fill: isItineraryCountry ? "#34A853" : "#D6D6DA",
                              outline: "none",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                            },
                            hover: {
                              fill: isItineraryCountry ? "#2E7D32" : "#F53",
                              outline: "none",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: isItineraryCountry ? "#1B5E20" : "#E42",
                              outline: "none",
                            },
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-white !important">{tooltipContent}</TooltipContent>
                    </Tooltip>
                  )
                })
              }
            </Geographies>

            {/* Render markers for active countries */}
            {activeCountries.map((countryCode) => {
              const country = countryData[countryCode]
              if (!country) return null

              const size = getMarkerSize(country.value)

              return (
                <Marker key={countryCode} coordinates={country.coordinates}>
                  <g>
                    <circle
                      r={size}
                      fill="#e67e22"
                      stroke="#fff"
                      strokeWidth={1}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setActiveCountries((prev) => prev.filter((code) => code !== countryCode))
                      }}
                    />
                    <text
                      textAnchor="middle"
                      y="2"
                      style={{
                        fontFamily: "Arial",
                        fontSize: "10px",
                        fill: "#fff",
                        fontWeight: "bold",
                        pointerEvents: "none",
                      }}
                    >
                      {country.value}
                    </text>
                  </g>
                </Marker>
              )
            })}

            {/* Small red dots for all countries with data */}
            {Object.entries(countryData).map(([code, country]) => (
              <Marker key={`dot-${code}`} coordinates={country.coordinates}>
                <circle
                  r={3}
                  fill="#e74c3c"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (country.hasItinerary && country.destinationId) {
                      router.push(`/country/${country.destinationId}`)
                    } else if (!activeCountries.includes(code)) {
                      setActiveCountries((prev) => [...prev, code])
                    } else {
                      setActiveCountries((prev) => prev.filter((c) => c !== code))
                    }
                  }}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </TooltipProvider>
    </div>
  )
}
