"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { scaleLog } from "d3-scale"
import { interpolateRainbow } from "d3-scale-chromatic"

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

const countriesWithItineraries = [
  { id: "GRC", name: "Greece", destinationId: "greece" },
  { id: "ITA", name: "Italy", destinationId: "italy" },
  { id: "JPN", name: "Japan", destinationId: "japan" },
  { id: "FRA", name: "France", destinationId: "france" },
]

const countryData = {
  USA: { value: 8, coordinates: [-98.5795, 39.8283] },
  CAN: { value: 4, coordinates: [-106.3468, 56.1304] },
  GBR: { value: 9, coordinates: [-3.436, 55.3781] },
  FRA: { value: 2, coordinates: [2.2137, 46.2276], hasItinerary: true, destinationId: "france" },
  DEU: { value: 3, coordinates: [10.4515, 51.1657] },
  JPN: { value: 5, coordinates: [138.2529, 36.2048], hasItinerary: true, destinationId: "japan" },
  AUS: { value: 1, coordinates: [133.7751, -25.2744] },
  BRA: { value: 6, coordinates: [-51.9253, -14.235] },
  IND: { value: 2, coordinates: [78.9629, 20.5937] },
  CHN: { value: 10, coordinates: [104.1954, 35.8617] },
  ZAF: { value: 1, coordinates: [22.9375, -30.5595] },
  RUS: { value: 7, coordinates: [105.3188, 61.524] },
  MEX: { value: 3, coordinates: [-102.5528, 23.6345] },
  ARG: { value: 1, coordinates: [-63.6167, -38.4161] },
  EGY: { value: 1, coordinates: [30.8025, 26.8206] },
  GRC: { value: 2, coordinates: [21.8243, 39.0742], hasItinerary: true, destinationId: "greece" },
  ITA: { value: 3, coordinates: [12.5674, 41.8719], hasItinerary: true, destinationId: "italy" },
}

const colorScale = scaleLog().domain([1, 10]).clamp(true).range([0, 1])

const getFillColor = (value?: number) => {
  if (!value || value < 1) return "#f0f0f0"
  return interpolateRainbow(colorScale(value))
}

export default function WorldMap() {
  const [tooltipContent, setTooltipContent] = useState("")
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 })
  const [activeCountries, setActiveCountries] = useState<string[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  return (
    <div className="relative h-full" ref={mapRef}>
      <TooltipProvider>
        <ComposableMap projection="geoMercator" className="h-full w-full">
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={(p) => setPosition(p)}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const iso = geo.properties.ISO_A3
                  const data = countryData[iso]
                  const isItinerary = countriesWithItineraries.some((c) => c.id === iso)

                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          onMouseEnter={() => {
                            const name = geo.properties.NAME
                            const count = data?.value ?? 0
                            const hasItinerary = isItinerary ? " (Click to view country page)" : ""
                            setTooltipContent(`${name}${hasItinerary} — ${count} submissions`)
                          }}
                          onMouseLeave={() => setTooltipContent("")}
                          onClick={() => {
                            if (isItinerary && data?.destinationId) {
                              router.push(`/country/${data.destinationId}`)
                            } else {
                              setActiveCountries((prev) =>
                                prev.includes(iso) ? prev.filter((c) => c !== iso) : [...prev, iso]
                              )
                            }
                          }}
                          style={{
                            default: {
                              fill: getFillColor(data?.value),
                              outline: "none",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                            },
                            hover: {
                              fill: "#F53",
                              outline: "none",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                              cursor: "pointer",
                            },
                            pressed: {
                              fill: "#E42",
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

      {/* Gradient Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-md text-sm w-[220px]">
        <div className="mb-1">Expertise</div>
        <svg width="200" height="10">
          <defs>
            <linearGradient id="log-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val, i) => (
                <stop
                  key={val}
                  offset={`${(i / 9) * 100}%`}
                  stopColor={interpolateRainbow(colorScale(val))}
                />
              ))}
            </linearGradient>
          </defs>
          <rect width="200" height="10" fill="url(#log-gradient)" />
        </svg>
        <div className="flex justify-between mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}
