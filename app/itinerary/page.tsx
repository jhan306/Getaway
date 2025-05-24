"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Globe, ArrowLeft, MapPin, Clock, X, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Sample destination data
const destinations = [
  { id: "greece", name: "Greece", flag: "🇬🇷" },
  { id: "italy", name: "Italy", flag: "🇮🇹" },
  { id: "japan", name: "Japan", flag: "🇯🇵" },
  { id: "france", name: "France", flag: "🇫🇷" },
]

// Activity types with their colors
const activityTypes = {
  sightseeing: { name: "Sightseeing", color: "#4285F4" }, // Blue
  food: { name: "Food & Dining", color: "#34A853" }, // Green
  tour: { name: "Tours", color: "#EA4335" }, // Red
  leisure: { name: "Leisure", color: "#FBBC05" }, // Yellow
  cultural: { name: "Cultural", color: "#9C27B0" }, // Purple
  outdoor: { name: "Outdoor", color: "#009688" }, // Teal
  transport: { name: "Transport", color: "#607D8B" }, // Blue-grey
  accommodation: { name: "Accommodation", color: "#FF9800" }, // Orange
}

// Initial activities data
const initialActivities = [
  {
    id: "activity-1",
    name: "Parthenon",
    image: "/images/parthenon.jpg", // Update this path to your actual image
    duration: "2 hours",
    location: "Athens",
    description: "Visit the iconic ancient Greek temple",
    type: "sightseeing",
  },
  {
    id: "activity-2",
    name: "Acropolis Museum",
    image: "/images/acropolis-museum.jpg", // Update this path to your actual image
    duration: "3 hours",
    location: "Athens",
    description: "Explore artifacts from the Acropolis archaeological site",
    type: "cultural",
  },
  {
    id: "activity-3",
    name: "Santorini Sunset",
    image: "/images/santorini-sunset.jpg",
    duration: "2 hours",
    location: "Santorini",
    description: "Watch the famous sunset over the caldera",
    type: "leisure",
  },
  {
    id: "activity-4",
    name: "Mykonos Beaches",
    image: "/images/mykonos-beaches.jpg",
    duration: "4 hours",
    location: "Mykonos",
    description: "Relax at the beautiful beaches of Mykonos",
    type: "leisure",
  },
  {
    id: "activity-5",
    name: "Delphi",
    image: "/images/delphi.jpg",
    duration: "5 hours",
    location: "Delphi",
    description: "Visit the ancient sanctuary of Apollo",
    type: "tour",
  },
  {
    id: "activity-6",
    name: "Meteora Monasteries",
    image: "/images/meteora-monasteries.jpg",
    duration: "6 hours",
    location: "Meteora",
    description: "Explore the monasteries built on natural rock pillars",
    type: "tour",
  },
  {
    id: "activity-7",
    name: "Greek Cooking Class",
    image: "/images/greek-cooking-class.jpg",
    duration: "3 hours",
    location: "Athens",
    description: "Learn to cook traditional Greek dishes",
    type: "food",
  },
  {
    id: "activity-8",
    name: "Olympia",
    image: "/images/olympia.jpg",
    duration: "4 hours",
    location: "Olympia",
    description: "Visit the birthplace of the Olympic Games",
    type: "sightseeing",
  },
  {
    id: "activity-9",
    name: "Corinth Canal",
    image: "/images/corinth-canal.jpg",
    duration: "1 hour",
    location: "Corinth",
    description: "See the narrow canal connecting the Gulf of Corinth with the Saronic Gulf",
    type: "sightseeing",
  },
  {
    id: "activity-10",
    name: "Traditional Greek Taverna",
    image: "/images/greek-taverna.jpg",
    duration: "2 hours",
    location: "Athens",
    description: "Enjoy authentic Greek cuisine with local specialties",
    type: "food",
  },
  {
    id: "activity-11",
    name: "Athens City Tour",
    image: "/images/athens-city-tour.jpg",
    duration: "4 hours",
    location: "Athens",
    description: "Guided tour of Athens' main attractions",
    type: "tour",
  },
  {
    id: "activity-12",
    name: "Greek Wine Tasting",
    image: "/images/greek-wine-tasting.jpg",
    duration: "2 hours",
    location: "Santorini",
    description: "Sample local Greek wines with expert guidance",
    type: "food",
  },
]

// Time slots for the calendar
const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
]

// Helper function to format time for display
const formatTimeRange = (startTime, durationHours) => {
  const startIndex = timeSlots.indexOf(startTime)
  if (startIndex === -1) return ""

  // Parse the start time
  const [startHour, startMinute] = startTime
    .match(/(\d+):(\d+)/)
    .slice(1, 3)
    .map(Number)
  const startPeriod = startTime.includes("PM") ? "PM" : "AM"

  // Calculate end time
  let endHour = startHour + durationHours
  let endPeriod = startPeriod

  // Handle period change
  if (startPeriod === "AM" && endHour >= 12) {
    endPeriod = "PM"
    if (endHour > 12) endHour -= 12
  } else if (startPeriod === "PM" && endHour > 12) {
    endHour -= 12
  }

  return `${startHour}:${startMinute === 0 ? "00" : startMinute}${startPeriod} - ${endHour}:${
    startMinute === 0 ? "00" : startMinute
  }${endPeriod}`
}

export default function ItineraryPage() {
  const searchParams = useSearchParams()
  const destinationParam = searchParams.get("destination")

  const [selectedDestination, setSelectedDestination] = useState(
    destinations.find((d) => d.id === destinationParam) || destinations[0],
  )
  const [currentDate, setCurrentDate] = useState(new Date())
  const [availableActivities, setAvailableActivities] = useState([...initialActivities])
  const [scheduledActivities, setScheduledActivities] = useState({})
  const [isGoogleCalendarAuthorized, setIsGoogleCalendarAuthorized] = useState(false)
  const { toast } = useToast()

  // Set the selected destination based on URL parameter
  useEffect(() => {
    if (destinationParam) {
      const destination = destinations.find((d) => d.id === destinationParam)
      if (destination) {
        setSelectedDestination(destination)
      }
    }
  }, [destinationParam])

  // Generate dates for the calendar view (3 days starting from current date)
  const calendarDates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + i)
    return date
  })

  // Format date for display
  const formatDate = (date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const day = days[date.getDay()]
    const dateNum = date.getDate().toString().padStart(2, "0")
    return { day, dateNum }
  }

  // Parse duration string to number of hours
  const parseDuration = (durationStr) => {
    const match = durationStr.match(/(\d+)/)
    if (match && match[1]) {
      return Number.parseInt(match[1], 10)
    }
    return 1 // Default to 1 hour if parsing fails
  }

  // Check if time slots are available
  const areTimeSlotsAvailable = (dateStr, startTimeSlot, durationHours) => {
    const startIndex = timeSlots.indexOf(startTimeSlot)
    if (startIndex === -1) return false

    // Check if there are enough time slots left in the day
    if (startIndex + durationHours > timeSlots.length) return false

    // Check if any of the required slots are already occupied
    for (let i = 0; i < durationHours; i++) {
      const timeSlot = timeSlots[startIndex + i]
      if (scheduledActivities[`${dateStr}-${timeSlot}`]) return false
    }

    return true
  }

  // Handle drag end event
  const onDragEnd = (result) => {
    const { source, destination } = result

    // If dropped outside a droppable area
    if (!destination) return

    // If dropped in the calendar
    if (destination.droppableId.startsWith("calendar-")) {
      const [_, dateStr, timeSlot] = destination.droppableId.split("-")
      const activityId = result.draggableId

      // Find the activity in available activities
      const activityIndex = availableActivities.findIndex((a) => a.id === activityId)
      if (activityIndex === -1) return

      const activity = availableActivities[activityIndex]
      const durationHours = parseDuration(activity.duration)

      // Check if all required time slots are available
      if (!areTimeSlotsAvailable(dateStr, timeSlot, durationHours)) {
        toast({
          title: "Cannot schedule activity",
          description: `Not enough available time slots for ${activity.name} (${activity.duration})`,
          variant: "destructive",
        })
        return
      }

      // Remove the activity from available activities
      const newAvailableActivities = [...availableActivities]
      newAvailableActivities.splice(activityIndex, 1)
      setAvailableActivities(newAvailableActivities)

      // Schedule the activity across multiple time slots
      const startIndex = timeSlots.indexOf(timeSlot)
      const newScheduledActivities = { ...scheduledActivities }
      const timeRange = formatTimeRange(timeSlot, durationHours)

      for (let i = 0; i < durationHours; i++) {
        const currentTimeSlot = timeSlots[startIndex + i]
        newScheduledActivities[`${dateStr}-${currentTimeSlot}`] = {
          ...activity,
          isStart: i === 0,
          isEnd: i === durationHours - 1,
          position: i,
          totalSlots: durationHours,
          timeRange,
        }
      }

      setScheduledActivities(newScheduledActivities)

      toast({
        title: "Activity scheduled",
        description: `${activity.name} (${activity.duration}) added to your itinerary at ${timeSlot}`,
      })
    }
  }

  // Remove an activity from the schedule and return it to available activities
  const removeActivity = (dateStr, timeSlot) => {
    const activityKey = `${dateStr}-${timeSlot}`
    const activity = scheduledActivities[activityKey]

    if (!activity) return

    // Get the original activity without the added scheduling properties
    const originalActivity = {
      id: activity.id,
      name: activity.name,
      image: activity.image,
      duration: activity.duration,
      location: activity.location,
      description: activity.description,
      type: activity.type,
    }

    // Add the activity back to available activities
    setAvailableActivities((prev) => [...prev, originalActivity])

    // Remove from scheduled activities
    const { position, totalSlots } = activity
    const startIndex = timeSlots.indexOf(timeSlot) - position
    const newScheduledActivities = { ...scheduledActivities }

    // Remove all slots occupied by this activity
    for (let i = 0; i < totalSlots; i++) {
      const currentTimeSlot = timeSlots[startIndex + i]
      delete newScheduledActivities[`${dateStr}-${currentTimeSlot}`]
    }

    setScheduledActivities(newScheduledActivities)

    toast({
      title: "Activity removed",
      description: `${activity.name} has been removed from your itinerary`,
    })
  }

  // Mock function to authorize with Google Calendar
  const authorizeGoogleCalendar = () => {
    // In a real implementation, this would redirect to Google OAuth
    setIsGoogleCalendarAuthorized(true)
    toast({
      title: "Google Calendar connected",
      description: "Your itinerary can now be synced with Google Calendar",
    })
  }

  // Mock function to export to Google Calendar
  const exportToGoogleCalendar = () => {
    toast({
      title: "Exported to Google Calendar",
      description: "Your itinerary has been added to your Google Calendar",
    })
  }

  // Navigate to previous 3 days
  const previousDays = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 3)
    setCurrentDate(newDate)
  }

  // Navigate to next 3 days
  const nextDays = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 3)
    setCurrentDate(newDate)
  }

  // Reset the itinerary
  const resetItinerary = () => {
    setAvailableActivities([...initialActivities])
    setScheduledActivities({})
    toast({
      title: "Itinerary reset",
      description: "All activities have been returned to the available list",
    })
  }

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
            <Link href="/itinerary" className="text-sm font-medium underline-offset-4 underline">
              Itinerary Planner
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 md:px-6 md:py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4 gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Destination selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{selectedDestination.flag}</div>
            <h1 className="text-4xl font-bold">{selectedDestination.name}</h1>
          </div>
          <div className="flex gap-2">
            <Tabs defaultValue={selectedDestination.id} className="w-[400px]">
              <TabsList className="grid grid-cols-4">
                {destinations.map((destination) => (
                  <TabsTrigger
                    key={destination.id}
                    value={destination.id}
                    onClick={() => setSelectedDestination(destination)}
                  >
                    {destination.flag} {destination.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Activity type legend */}
        <div className="mb-4 flex flex-wrap gap-3">
          {Object.entries(activityTypes).map(([key, { name, color }]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{name}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between mb-4">
          <Button onClick={resetItinerary} variant="outline" size="sm">
            Reset Itinerary
          </Button>

          {!isGoogleCalendarAuthorized ? (
            <Button onClick={authorizeGoogleCalendar} variant="outline" size="sm">
              Connect Google Calendar
            </Button>
          ) : (
            <Button onClick={exportToGoogleCalendar} variant="outline" size="sm">
              Export to Google Calendar
            </Button>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Calendar View */}
            <Card className="overflow-hidden bg-white">
              <CardContent className="p-0">
                {/* Calendar navigation */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
                  <Button variant="ghost" size="sm" onClick={previousDays}>
                    Previous
                  </Button>
                  <div className="font-medium">
                    {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentDate)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={nextDays}>
                    Next
                  </Button>
                </div>

                {/* Calendar header */}
                <div className="grid grid-cols-3 border-b border-gray-200 bg-white">
                  {calendarDates.map((date, index) => {
                    const { day, dateNum } = formatDate(date)
                    return (
                      <div key={index} className="text-center py-4 border-r border-gray-200 last:border-r-0">
                        <div className="text-sm text-black">{day}</div>
                        <div className="text-3xl font-bold text-black">{dateNum}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Calendar time slots */}
                <div className="grid grid-cols-[auto_1fr_1fr_1fr] bg-white">
                  {/* Time labels */}
                  <div className="border-r border-gray-200">
                    {timeSlots.map((time, index) => (
                      <div key={index} className="h-16 flex items-center justify-end pr-2 text-sm text-black">
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Calendar cells for each day */}
                  {calendarDates.map((date, dateIndex) => {
                    const dateStr = date.toISOString().split("T")[0]
                    return (
                      <div key={dateIndex} className="border-r border-gray-200 last:border-r-0">
                        {timeSlots.map((time, timeIndex) => {
                          const cellKey = `${dateStr}-${time}`
                          const scheduledActivity = scheduledActivities[cellKey]

                          // Skip rendering droppable for slots that are part of a multi-slot activity but not the start
                          if (scheduledActivity && !scheduledActivity.isStart && scheduledActivity.position > 0) {
                            return (
                              <div key={timeIndex} className="h-16 border-b border-gray-200 last:border-b-0 relative" />
                            )
                          }

                          return (
                            <Droppable
                              key={timeIndex}
                              droppableId={`calendar-${dateStr}-${time}`}
                              isDropDisabled={!!scheduledActivity}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`h-16 border-b border-gray-200 last:border-b-0 relative ${
                                    snapshot.isDraggingOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""
                                  }`}
                                >
                                  {scheduledActivity && scheduledActivity.isStart ? (
                                    <div
                                      className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                                      style={{
                                        height: `calc(${scheduledActivity.totalSlots * 16}rem - 0.5rem)`,
                                        top: "0.25rem",
                                        backgroundColor: activityTypes[scheduledActivity.type]?.color || "#4285F4",
                                        color: "white",
                                      }}
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="font-medium text-sm text-black">{scheduledActivity.name}</div>
                                        <button
                                          onClick={() => removeActivity(dateStr, time)}
                                          className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-black/10"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>

                                      {/* Enhanced activity information display */}
                                      <div className="mt-1 flex flex-col gap-1">
                                        <div className="flex items-center gap-1 text-black text-xs">
                                          <MapPin className="h-3 w-3 text-black" />
                                          <span>{scheduledActivity.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-black text-xs">
                                          <Clock className="h-3 w-3 text-black" />
                                          <span>{scheduledActivity.timeRange}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-black text-xs">
                                          <Tag className="h-3 w-3 text-black" />
                                          <span>{activityTypes[scheduledActivity.type]?.name || "Activity"}</span>
                                        </div>
                                      </div>

                                      {/* Show description if there's enough space */}
                                      {scheduledActivity.totalSlots >= 3 && (
                                        <div className="mt-2 text-black text-xs line-clamp-2">
                                          {scheduledActivity.description}
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activities Panel */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Available Activities</h2>
                <p className="text-sm text-gray-500">Drag activities to the calendar to schedule them</p>
              </div>

              <Droppable droppableId="activities" isDropDisabled={false}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="p-4 grid grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto"
                  >
                    {availableActivities.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No available activities. Remove activities from the calendar to return them here.
                      </div>
                    ) : (
                      availableActivities.map((activity, index) => (
                        <Draggable key={activity.id} draggableId={activity.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-md border overflow-hidden cursor-grab ${
                                snapshot.isDragging
                                  ? "ring-2 ring-primary shadow-lg"
                                  : "hover:shadow-md transition-shadow"
                              }`}
                            >
                              <div className="relative h-32 bg-gray-100">
                                <div
                                  className="absolute top-0 left-0 w-full h-1"
                                  style={{ backgroundColor: activityTypes[activity.type]?.color || "#4285F4" }}
                                ></div>
                                <Image
                                  src={activity.image || "/placeholder.svg"}
                                  alt={activity.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <div className="font-medium">{activity.name}</div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>{activity.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{activity.duration}</span>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span
                                    className="inline-block px-2 py-0.5 text-xs rounded-full text-white"
                                    style={{ backgroundColor: activityTypes[activity.type]?.color || "#4285F4" }}
                                  >
                                    {activityTypes[activity.type]?.name || "Activity"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
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
