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

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json"

// Country data with full names and flag emojis
const countryData = {
  USA: { value: 0, name: "United States", flag: "🇺🇸", coordinates: [-98.5795, 39.8283] },
  CAN: { value: 4, name: "Canada", flag: "🇨🇦", coordinates: [-106.3468, 56.1304] },
  GBR: { value: 0, name: "United Kingdom", flag: "🇬🇧", coordinates: [-3.436, 55.3781] },
  FRA: { value: 0, name: "France", flag: "🇫🇷", coordinates: [2.2137, 46.2276] },
  DEU: { value: 0, name: "Germany", flag: "🇩🇪", coordinates: [10.4515, 51.1657] },
  JPN: { value: 5, name: "Japan", flag: "🇯🇵", coordinates: [138.2529, 36.2048] },
  AUS: { value: 0, name: "Australia", flag: "🇦🇺", coordinates: [133.7751, -25.2744] },
  BRA: { value: 0, name: "Brazil", flag: "🇧🇷", coordinates: [-51.9253, -14.235] },
  IND: { value: 0, name: "India", flag: "🇮🇳", coordinates: [78.9629, 20.5937] },
  CHN: { value: 10, name: "China", flag: "🇨🇳", coordinates: [104.1954, 35.8617] },
  ZAF: { value: 0, name: "South Africa", flag: "🇿🇦", coordinates: [22.9375, -30.5595] },
  RUS: { value: 0, name: "Russia", flag: "🇷🇺", coordinates: [105.3188, 61.524] },
  MEX: { value: 0, name: "Mexico", flag: "🇲🇽", coordinates: [-102.5528, 23.6345] },
  ARG: { value: 0, name: "Argentina", flag: "🇦🇷", coordinates: [-63.6167, -38.4161] },
  EGY: { value: 0, name: "Egypt", flag: "🇪🇬", coordinates: [30.8025, 26.8206] },
  GRC: { value: 10, name: "Greece", flag: "🇬🇷", coordinates: [21.8243, 39.0742] },
  ITA: { value: 2, name: "Italy", flag: "🇮🇹", coordinates: [12.5674, 41.8719] },
  ESP: { value: 0, name: "Spain", flag: "🇪🇸", coordinates: [-3.7492, 40.4637] },
  KOR: { value: 0, name: "South Korea", flag: "🇰🇷", coordinates: [127.7669, 35.9078] },
  NLD: { value: 0, name: "Netherlands", flag: "🇳🇱", coordinates: [5.2913, 52.1326] },
  SWE: { value: 0, name: "Sweden", flag: "🇸🇪", coordinates: [18.6435, 60.1282] },
  NOR: { value: 0, name: "Norway", flag: "🇳🇴", coordinates: [8.4689, 60.472] },
  VNM: { value: 0, name: "Vietnam", flag: "🇻🇳", coordinates: [108.2772, 14.0583] },
  PHL: { value: 0, name: "Philippines", flag: "🇵🇭", coordinates: [121.774, 12.8797] },
  CHE: { value: 0, name: "Switzerland", flag: "🇨🇭", coordinates: [8.2275, 46.8182] },
  PRT: { value: 0, name: "Portugal", flag: "🇵🇹", coordinates: [-8.2245, 39.3999] },
  ARE: { value: 0, name: "United Arab Emirates", flag: "🇦🇪", coordinates: [53.8478, 23.4241] },
  PER: { value: 0, name: "Peru", flag: "🇵🇪", coordinates: [-75.0152, -9.1899] },
  KEN: { value: 0, name: "Kenya", flag: "🇰🇪", coordinates: [37.9062, -0.0236] },
  THA: { value: 0, name: "Thailand", flag: "🇹🇭", coordinates: [100.9925, 15.87] },
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
                  const isClickable = !!data

                  return (
                    <Tooltip key={geo.rsmKey}>
                      <TooltipTrigger asChild>
                        <Geography
                          geography={geo}
                          onMouseEnter={() => {
                            const name = data?.name ?? geo.properties.NAME
                            const count = data?.value ?? 0
                            const hint = isClickable ? " (Click to view)" : ""
                            setTooltipContent(`${name}${hint} — ${count} submissions`)
                          }}
                          onMouseLeave={() => setTooltipContent("")}
                          onClick={() => {
                            if (isClickable && data?.destinationId) {
                              router.push(`/country/${data.destinationId}`)
                            } else {
                              setActiveCountries((prev) =>
                                prev.includes(iso) ? prev.filter((c) => c !== iso) : [...prev, iso]
                              )
                            }
                          }}
                          style={{
                            default: {
                              fill: "#e5e5e5",
                              stroke: "#FFFFFF",
                              strokeWidth: 0.5,
                            },
                            hover: {
                              fill: "#F53",
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
                      <TooltipContent className="text-white">{tooltipContent}</TooltipContent>
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
                    if (country.destinationId) {
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

      {/* 🏆 Top 5 Countries Leaderboard */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow-md text-sm w-[250px]">
        <div className="mb-2 font-bold text-lg">Top 5 Countries</div>
        <ol className="list-decimal list-inside space-y-1">
          {Object.entries(countryData)
            .filter(([_, data]) => data.value > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .slice(0, 5)
            .map(([iso, data], index) => (
              <li key={iso}>
                {data.flag} {data.name}
              </li>
            ))}
        </ol>
      </div>
    </div>
  )
}
