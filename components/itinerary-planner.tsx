"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, X, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ActivityCard } from "@/components/activity-card"

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

// Initial activities data by country
const activitiesByCountry = {
  greece: [
    {
      id: "activity-1",
      name: "Parthenon",
      image: "/images/parthenon.jpg", // Update this path to your actual image
      duration: "2 hours",
      location: "Athens",
      description: "Visit the iconic ancient Greek temple",
      type: "sightseeing",
      physicalRating: 3,
      scenicRating: 5,
      culturalRating: 5,
    },
    {
      id: "activity-2",
      name: "Acropolis Museum",
      image: "/images/acropolis-museum.jpg", // Update this path to your actual image
      duration: "3 hours",
      location: "Athens",
      description: "Explore artifacts from the Acropolis archaeological site",
      type: "cultural",
      physicalRating: 2,
      scenicRating: 4,
      culturalRating: 5,
    },
    {
      id: "activity-3",
      name: "Santorini Sunset",
      image: "/images/santorini.jpg", // Update this path to your actual image
      duration: "2 hours",
      location: "Santorini",
      description: "Watch the famous sunset over the caldera",
      type: "leisure",
      physicalRating: 1,
      scenicRating: 5,
      culturalRating: 3,
    },
    {
      id: "activity-4",
      name: "Mykonos Beaches",
      image: "/images/mykonos.jpg", // Update this path to your actual image
      duration: "4 hours",
      location: "Mykonos",
      description: "Relax at the beautiful beaches of Mykonos",
      type: "leisure",
      physicalRating: 2,
      scenicRating: 5,
      culturalRating: 2,
    },
    {
      id: "activity-5",
      name: "Delphi",
      image: "/images/delphi.jpg", // Update this path to your actual image
      duration: "5 hours",
      location: "Delphi",
      description: "Visit the ancient sanctuary of Apollo",
      type: "tour",
      physicalRating: 4,
      scenicRating: 5,
      culturalRating: 5,
    },
    {
      id: "activity-6",
      name: "Meteora Monasteries",
      image: "/images/meteora.jpg", // Update this path to your actual image
      duration: "6 hours",
      location: "Meteora",
      description: "Explore the monasteries built on natural rock pillars",
      type: "tour",
      physicalRating: 4,
      scenicRating: 5,
      culturalRating: 5,
    },
    {
      id: "activity-7",
      name: "Greek Cooking Class",
      image: "/placeholder.svg?height=200&width=300",
      duration: "3 hours",
      location: "Athens",
      description: "Learn to cook traditional Greek dishes",
      type: "food",
      physicalRating: 2,
      scenicRating: 3,
      culturalRating: 4,
    },
    {
      id: "activity-8",
      name: "Olympia",
      image: "/placeholder.svg?height=200&width=300",
      duration: "4 hours",
      location: "Olympia",
      description: "Visit the birthplace of the Olympic Games",
      type: "sightseeing",
      physicalRating: 3,
      scenicRating: 4,
      culturalRating: 5,
    },
    {
      id: "activity-9",
      name: "Corinth Canal",
      image: "/placeholder.svg?height=200&width=300",
      duration: "1 hour",
      location: "Corinth",
      description: "See the narrow canal connecting the Gulf of Corinth with the Saronic Gulf",
      type: "sightseeing",
      physicalRating: 1,
      scenicRating: 4,
      culturalRating: 3,
    },
    {
      id: "activity-10",
      name: "Traditional Greek Taverna",
      image: "/placeholder.svg?height=200&width=300",
      duration: "2 hours",
      location: "Athens",
      description: "Enjoy authentic Greek cuisine with local specialties",
      type: "food",
      physicalRating: 1,
      scenicRating: 3,
      culturalRating: 4,
    },
    {
      id: "activity-11",
      name: "Athens City Tour",
      image: "/placeholder.svg?height=200&width=300",
      duration: "4 hours",
      location: "Athens",
      description: "Guided tour of Athens' main attractions",
      type: "tour",
      physicalRating: 3,
      scenicRating: 4,
      culturalRating: 5,
    },
    {
      id: "activity-12",
      name: "Greek Wine Tasting",
      image: "/placeholder.svg?height=200&width=300",
      duration: "2 hours",
      location: "Santorini",
      description: "Sample local Greek wines with expert guidance",
      type: "food",
      physicalRating: 1,
      scenicRating: 4,
      culturalRating: 4,
    },
  ],
  italy: [
    {
      id: "italy-1",
      name: "Colosseum",
      image: "/placeholder.svg?height=200&width=300",
      duration: "3 hours",
      location: "Rome",
      description: "Visit the iconic Roman amphitheater",
      type: "sightseeing",
      physicalRating: 3,
      scenicRating: 5,
      culturalRating: 5,
    },
    {
      id: "italy-2",
      name: "Vatican Museums",
      image: "/placeholder.svg?height=200&width=300",
      duration: "4 hours",
      location: "Vatican City",
      description: "Explore one of the world's greatest art collections",
      type: "cultural",
      physicalRating: 3,
      scenicRating: 5,
      culturalRating: 5,
    },
  ],
  japan: [
    {
      id: "japan-1",
      name: "Tokyo Tower",
      image: "/placeholder.svg?height=200&width=300",
      duration: "2 hours",
      location: "Tokyo",
      description: "Visit the iconic Tokyo Tower for panoramic views",
      type: "sightseeing",
      physicalRating: 2,
      scenicRating: 5,
      culturalRating: 3,
    },
    {
      id: "japan-2",
      name: "Fushimi Inari Shrine",
      image: "/placeholder.svg?height=200&width=300",
      duration: "3 hours",
      location: "Kyoto",
      description: "Walk through thousands of torii gates",
      type: "cultural",
      physicalRating: 4,
      scenicRating: 5,
      culturalRating: 5,
    },
  ],
  france: [
    {
      id: "france-1",
      name: "Eiffel Tower",
      image: "/placeholder.svg?height=200&width=300",
      duration: "3 hours",
      location: "Paris",
      description: "Visit the iconic Eiffel Tower",
      type: "sightseeing",
      physicalRating: 3,
      scenicRating: 5,
      culturalRating: 4,
    },
    {
      id: "france-2",
      name: "Louvre Museum",
      image: "/placeholder.svg?height=200&width=300",
      duration: "4 hours",
      location: "Paris",
      description: "Explore one of the world's largest art museums",
      type: "cultural",
      physicalRating: 2,
      scenicRating: 5,
      culturalRating: 5,
    },
  ],
}

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
const formatTimeRange = (startTime: string, durationHours: number) => {
  const startIndex = timeSlots.indexOf(startTime)
  if (startIndex === -1) return ""

  // Parse the start time
  const startTimeParts = startTime.match(/(\d+):(\d+)\s(AM|PM)/)
  if (!startTimeParts) return ""

  const startHour = Number.parseInt(startTimeParts[1], 10)
  const startMinute = Number.parseInt(startTimeParts[2], 10)
  const startPeriod = startTimeParts[3]

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

export default function ItineraryPlanner({ countryId = "greece" }: { countryId?: string }) {
  const selectedDestination = destinations.find((d) => d.id === countryId) || destinations[0]

  const [currentDate, setCurrentDate] = useState(new Date())
  const [availableActivities, setAvailableActivities] = useState([
    ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || []),
  ])
  const [scheduledActivities, setScheduledActivities] = useState<Record<string, any>>({})
  const [isGoogleCalendarAuthorized, setIsGoogleCalendarAuthorized] = useState(false)
  const { toast } = useToast()

  // Update available activities when country changes
  useEffect(() => {
    setAvailableActivities([...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || [])])
    setScheduledActivities({})
  }, [countryId])

  // Generate dates for the calendar view (3 days starting from current date)
  const calendarDates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(currentDate)
    date.setDate(date.getDate() + i)
    return date
  })

  // Format date for display
  const formatDate = (date: Date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const day = days[date.getDay()]
    const dateNum = date.getDate().toString().padStart(2, "0")
    return { day, dateNum }
  }

  // Parse duration string to number of hours
  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+(?:\.\d+)?)/)
    if (match && match[1]) {
      return Number.parseInt(match[1], 10)
    }
    return 1 // Default to 1 hour if parsing fails
  }

  // Check if time slots are available
  const areTimeSlotsAvailable = (dateStr: string, startTimeSlot: string, durationHours: number) => {
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
  const onDragEnd = (result: any) => {
    const { source, destination } = result

    // If dropped outside a droppable area
    if (!destination) return

    // If dropped in the calendar
    if (destination.droppableId.startsWith("calendar|")) {
      const [, dateStr, timeSlot] = destination.droppableId.split("|");
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
  const removeActivity = (dateStr: string, timeSlot: string) => {
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
      physicalRating: activity.physicalRating,
      scenicRating: activity.scenicRating,
      culturalRating: activity.culturalRating,
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
    setAvailableActivities([...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || [])])
    setScheduledActivities({})
    toast({
      title: "Itinerary reset",
      description: "All activities have been returned to the available list",
    })
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Activity type legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(activityTypes).map(([key, { name, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs text-black">{name}</span>
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
                <div className="font-medium text-black">
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
                            <div key={timeIndex} className="h-16 border-b border-gray-200 last:border-b-0 relative" style={{ overflow: "visible" }}>/>
                          )
                        }

                        return (
                          <Droppable
                            key={timeIndex}
                            droppableId={`calendar|${dateStr}|${time}`}
                            isDropDisabled={!!scheduledActivity}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`h-16 border-b border-gray-200 last:border-b-0 relative ${
                                  snapshot.isDraggingOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : ""
                                }`}
                                style={{ overflow: "visible" }}
                              >
                                {scheduledActivity && scheduledActivity.isStart ? (
                                  <div
                                    className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                                    style={{
                                      height: `calc(${scheduledActivity.totalSlots * 4}rem - 0.5rem)`,
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
              <h2 className="text-lg font-semibold text-black">Available Activities</h2>
              <p className="text-sm text-black">Drag activities to the calendar to schedule them</p>
            </div>

            <Droppable droppableId="activities" isDropDisabled={false}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 grid grid-cols-2 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto"
                >
                  {availableActivities.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-black">
                      No available activities. Remove activities from the calendar to return them here.
                    </div>
                  ) : (
                    availableActivities.map((activity, index) => (
                      <Draggable key={activity.id} draggableId={activity.id} index={index}>
                        {(provided, snapshot) => (
                          <ActivityCard
                            activity={activity}
                            isDraggable={true}
                            innerRef={provided.innerRef}
                            draggableProps={provided.draggableProps}
                            dragHandleProps={provided.dragHandleProps}
                            className={snapshot.isDragging ? "shadow-lg" : ""}
                          />
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
    </div>
  )
}
