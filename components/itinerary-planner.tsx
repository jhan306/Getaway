// components/itinerary-planner.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, X, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ActivityCard } from "@/components/activity-card";
import { cn } from "@/lib/utils";

// SAMPLE DESTINATION DATA (unused in this example, but kept for future use if needed)
const destinations = [
  { id: "greece", name: "Greece", flag: "🇬🇷" },
  { id: "italy",  name: "Italy",  flag: "🇮🇹" },
  { id: "japan",  name: "Japan",  flag: "🇯🇵" },
  { id: "france", name: "France", flag: "🇫🇷" },
];

// DURATION OPTIONS (for the “Add Activity” modal)
const durationOptions = [
  "30 mins",
  "1 hour",
  "1.5 hours",
  "2 hours",
  "2.5 hours",
  "3 hours",
  "3.5 hours",
  "4 hours",
  "4.5 hours",
  "5 hours",
  "5.5 hours",
  "6 hours",
  "6.5 hours",
  "7 hours",
  "7.5 hours",
  "8 hours",
];

// ACTIVITY TYPE DEFINITIONS
export type Activity = {
  id: string;
  name: string;
  image: string;
  duration: string;
  location: string;
  description: string;
  type: keyof typeof activityTypes;
  physicalRating: number;
  scenicRating: number;
  culturalRating: number;
};

type ScheduledMap = Record<string, any>;

type Trip = {
  id: string;
  name: string;
  flag: string;
  available: Activity[];
  scheduled: ScheduledMap;
};

// ACTIVITY COLORS & LABELS
const activityTypes = {
  sightseeing:   { name: "Sightseeing",      color: "#4285F4" },
  food:         { name: "Food & Dining",    color: "#34A853" },
  tour:         { name: "Tours",            color: "#EA4335" },
  leisure:      { name: "Leisure",          color: "#FBBC05" },
  cultural:     { name: "Cultural",         color: "#9C27B0" },
  outdoor:      { name: "Outdoor",          color: "#009688" },
  transport:    { name: "Transport",        color: "#607D8B" },
  accommodation:{ name: "Accommodation",    color: "#FF9800" },
};

// INITIAL ACTIVITIES BY COUNTRY
const activitiesByCountry = {
  greece: [
    {
      id: "activity-1",
      name: "Parthenon",
      image: "/images/parthenon.jpg",
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
      image: "/images/acropolis-museum.jpg",
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
      image: "/images/santorini.jpg",
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
      image: "/images/mykonos.jpg",
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
      image: "/images/delphi.jpg",
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
      image: "/images/meteora.jpg",
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
      description:
        "See the narrow canal connecting the Gulf of Corinth with the Saronic Gulf",
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
};

// TIME SLOTS FOR THE CALENDAR
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
];

// FORMAT TIME RANGE HELPER
const formatTimeRange = (startTime: string, durationHours: number) => {
  const startIndex = timeSlots.indexOf(startTime);
  if (startIndex === -1) return "";
  const [, rawHour, rawMin, startPeriod] = startTime.match(
    /(\d+):(\d+)\s(AM|PM)/
  ) as RegExpMatchArray;

  let endHour = Number(rawHour) + durationHours;
  let endPeriod = startPeriod;
  if (startPeriod === "AM" && endHour >= 12) {
    endPeriod = "PM";
    if (endHour > 12) endHour -= 12;
  } else if (startPeriod === "PM" && endHour > 12) {
    endHour -= 12;
  }
  return `${rawHour}:${rawMin.padEnd(2, "0")}${startPeriod} - ${endHour}:${rawMin.padEnd(
    2,
    "0"
  )}${endPeriod}`;
};

// GENERATE A LOCAL-ONLY Trip OBJECT
const makeTrip = (name: string, startActivities: Activity[] = []): Trip => ({
  id: crypto.randomUUID(),
  name,
  flag: tripFlag(name.toLowerCase()),
  available: [...startActivities],
  scheduled: {},
});

// COMPUTE A FLAG EMOJI FROM A LOWERCASED COUNTRY STRING
function tripFlag(id: string) {
  if (id === "japan") return "🇯🇵";
  if (id === "italy") return "🇮🇹";
  if (id === "france") return "🇫🇷";
  if (id === "greece") return "🇬🇷";
  return "🗺️";
}

export default function ItineraryPlanner({
  countryId,
  initialName,
}: {
  countryId?: string;
  initialName?: string;
}) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1) Build the initial list of “available” activities based on `countryId`
  //    (If `countryId` is invalid or missing, this array will be empty.)
  const initialAvail = [
    ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || []),
  ];

  // 2) Choose the trip’s initial name: if `initialName` is passed, use that;
  //    otherwise fall back to using the countryId itself (capitalized).
  const initialTripName =
    initialName && initialName.trim() !== ""
      ? initialName.trim()
      : countryId.charAt(0).toUpperCase() + countryId.slice(1);

  // 3) Instantiate a brand‐new Trip object in local state (no Supabase anywhere here!)
  const initialTrip: Trip = makeTrip(initialTripName, initialAvail);

  const [trips, setTrips] = useState<Trip[]>(() => [initialTrip]);
  const [currentId, setCurrentId] = useState(initialTrip.id);

  // State for “Add Activity” modal
  const [isAddOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDuration, setNewDuration] = useState("1 hour");
  const [newTag, setNewTag] = useState<keyof typeof activityTypes>(
    "sightseeing"
  );
  const [newDescription, setNewDescription] = useState("");

  // Find the “currentTrip” object in state:
  const currentTrip = trips.find((t) => t.id === currentId) as Trip;

  // Helper to partially update the current Trip
  const updateTrip = (partial: Partial<Trip>) =>
    setTrips((prev) =>
      prev.map((t) => (t.id === currentId ? { ...t, ...partial } : t))
    );

  // Aliases the fields the rest of the code expects
  const { available: availableActivities, scheduled: scheduledActivities } =
    currentTrip;
  const setAvailableActivities = (avail: Activity[]) =>
    updateTrip({ available: avail });
  const setScheduledActivities = (sched: ScheduledMap) =>
    updateTrip({ scheduled: sched });

  // ----- Add a brand‐new Activity to “available” ----- 
  const saveNewActivity = () => {
    if (!newTitle.trim()) return;

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: newTitle.trim(),
      image: "/placeholder.svg?height=200&width=300", // placeholder
      duration: newDuration,
      location: newLocation.trim() || "Unknown",
      description: newDescription.trim(),
      type: newTag,
      physicalRating: 1,
      scenicRating: 1,
      culturalRating: 1,
    };
    setAvailableActivities([...availableActivities, newActivity]);

    // reset & close the modal
    setNewTitle("");
    setNewLocation("");
    setNewDuration("1 hour");
    setNewTag("sightseeing");
    setNewDescription("");
    setAddOpen(false);
  };

  // Whenever `countryId` changes, re‐initialize “available” and clear any scheduled
  useEffect(() => {
    setAvailableActivities([
      ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || []),
    ]);
    setScheduledActivities({});
  }, [countryId]);

  // Generate a 3‐day calendar, starting at “today”
  const calendarDates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Format a date like “MON 09”
  const formatDate = (date: Date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const day = days[date.getDay()];
    const dateNum = date.getDate().toString().padStart(2, "0");
    return { day, dateNum };
  };

  // Convert “2 hours” → 2, etc.
  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+(?:\.\d+)?)/);
    if (match && match[1]) {
      return Number.parseInt(match[1], 10);
    }
    return 1; // fallback to 1 hour
  };

  // Check if a block of contiguous timeslots is free
  const areTimeSlotsAvailable = (
    dateStr: string,
    startTimeSlot: string,
    durationHours: number
  ) => {
    const startIndex = timeSlots.indexOf(startTimeSlot);
    if (startIndex === -1) return false;

    // If not enough slots remain in that day, bail
    if (startIndex + durationHours > timeSlots.length) return false;

    // If any slot is already taken, fail
    for (let i = 0; i < durationHours; i++) {
      const timeSlot = timeSlots[startIndex + i];
      if (scheduledActivities[`${dateStr}-${timeSlot}`]) return false;
    }
    return true;
  };

  // Handle drag/drop of an activity into the calendar
  const onDragEnd = (result: any) => {
    const { destination } = result;
    if (!destination) return;

    // If dropped into a calendar cell
    if (destination.droppableId.startsWith("calendar|")) {
      const [, dateStr, timeSlot] = destination.droppableId.split("|");
      const activityId = result.draggableId;

      // Find the activity in availableActivities
      const activityIndex = availableActivities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex === -1) return;

      const activity = availableActivities[activityIndex];
      const durationHours = parseDuration(activity.duration);

      // If not enough contiguous free slots, show a toast & abort
      if (!areTimeSlotsAvailable(dateStr, timeSlot, durationHours)) {
        toast({
          title: "Cannot schedule activity",
          description: `Not enough available time slots for ${activity.name} (${activity.duration})`,
          variant: "destructive",
        });
        return;
      }

      // Remove from “availableActivities”
      const newAvailableActivities = [...availableActivities];
      newAvailableActivities.splice(activityIndex, 1);

      // Build a brand‐new “scheduled” object, inserting this activity over multiple slots
      const startIndex = timeSlots.indexOf(timeSlot);
      const newScheduledActivities = { ...scheduledActivities };
      const timeRange = formatTimeRange(timeSlot, durationHours);

      for (let i = 0; i < durationHours; i++) {
        const currentTimeSlot = timeSlots[startIndex + i];
        newScheduledActivities[`${dateStr}-${currentTimeSlot}`] = {
          ...activity,
          isStart: i === 0,
          isEnd: i === durationHours - 1,
          position: i,
          totalSlots: durationHours,
          timeRange,
        };
      }

      updateTrip({
        available: newAvailableActivities,
        scheduled: newScheduledActivities,
      });

      toast({
        title: "Activity scheduled",
        description: `${activity.name} (${activity.duration}) added to your itinerary at ${timeSlot}`,
      });
    }
  };

  // Remove a multi‐slot activity from the calendar
  const removeActivity = (dateStr: string, timeSlot: string) => {
    const activityKey = `${dateStr}-${timeSlot}`;
    const activity = scheduledActivities[activityKey];
    if (!activity) return;

    // Reconstruct the “original” Activity object
    const originalActivity: Activity = {
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
    };

    // Add it back to availableActivities
    const newAvailableActivities = [...availableActivities, originalActivity];

    // Remove all time slots occupied by that activity
    const { position, totalSlots } = activity;
    const startIndex = timeSlots.indexOf(timeSlot) - position;
    const newScheduledActivities = { ...scheduledActivities };

    for (let i = 0; i < totalSlots; i++) {
      const currentTimeSlot = timeSlots[startIndex + i];
      delete newScheduledActivities[`${dateStr}-${currentTimeSlot}`];
    }

    updateTrip({
      available: newAvailableActivities,
      scheduled: newScheduledActivities,
    });

    toast({
      title: "Activity removed",
      description: `${activity.name} has been removed from your itinerary`,
    });
  };

  // Navigate the calendar 3 days backward
  const previousDays = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 3);
    setCurrentDate(newDate);
  };

  // Navigate the calendar 3 days forward
  const nextDays = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 3);
    setCurrentDate(newDate);
  };

  // Reset all scheduled activities and put everything back into “available”
  const resetItinerary = () => {
    setAvailableActivities([
      ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || []),
    ]);
    setScheduledActivities({});
    toast({
      title: "Itinerary reset",
      description: "All activities have been returned to the available list",
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* ─── Show trip’s flag & name at the top ─── */}
      <div className="flex items-center gap-2">
        <span className="text-3xl">{currentTrip.flag}</span>
        <h2 className="text-2xl font-semibold">{currentTrip.name}</h2>
      </div>

      {/* ─── Activity type legend ─── */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(activityTypes).map(([key, { name, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-black">{name}</span>
          </div>
        ))}
      </div>

      {/* ─── Reset Itinerary button ─── */}
      <div className="flex justify-between mb-4">
        <Button
          onClick={resetItinerary}
          className="bg-white text-black border border-gray-300 hover:bg-gray-100"
        >
          Reset Itinerary
        </Button>
      </div>

      {/* ─── Trip selector bar (if you ever have multiple local Trip objects to switch between) ─── */}
      <div className="flex items-center gap-4 mb-6">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setCurrentId(trip.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              trip.id === currentId ? "bg-amber-200" : "bg-gray-800 text-white/80"
            )}
          >
            <span>{trip.flag}</span>
            <span className={trip.id === currentId ? "text-black font-medium" : ""}>
              {trip.name}
            </span>
          </button>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* ─── Calendar View ─── */}
          <Card className="bg-white">
            <CardContent className="p-0 overflow-auto">
              {/* Calendar navigation */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
                <Button variant="ghost" size="sm" onClick={previousDays}>
                  Previous
                </Button>
                <div className="font-medium text-black">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    year: "numeric",
                  }).format(currentDate)}
                </div>
                <Button variant="ghost" size="sm" onClick={nextDays}>
                  Next
                </Button>
              </div>

              {/* Calendar header (day labels) */}
              <div className="grid grid-cols-3 border-b border-gray-200 bg-white">
                {calendarDates.map((date, idx) => {
                  const { day, dateNum } = formatDate(date);
                  return (
                    <div
                      key={idx}
                      className="text-center py-4 border-r border-gray-200 last:border-r-0"
                    >
                      <div className="text-sm text-black">{day}</div>
                      <div className="text-3xl font-bold text-black">{dateNum}</div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar timeslots grid */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] bg-white">
                {/* Time labels on far-left */}
                <div className="border-r border-gray-200">
                  {timeSlots.map((time, idx) => (
                    <div
                      key={idx}
                      className="h-16 flex items-center justify-end pr-2 text-sm text-black"
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* For each of the 3 days, build a column of cells */}
                {calendarDates.map((date, dateIndex) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return (
                    <div
                      key={dateIndex}
                      className="border-r border-gray-200 last:border-r-0"
                    >
                      {timeSlots.map((time, timeIndex) => {
                        const cellKey = `${dateStr}-${time}`;
                        const scheduledActivity = scheduledActivities[cellKey];

                        // If this slot is part of an already‐rendered multi‐slot activity (and not the “isStart”),
                        // skip rendering a Droppable for it; instead output an empty placeholder row.
                        if (
                          scheduledActivity &&
                          !scheduledActivity.isStart &&
                          scheduledActivity.position > 0
                        ) {
                          return (
                            <div
                              key={timeIndex}
                              className="h-16 border-b border-gray-200 last:border-b-0 relative"
                              style={{ overflow: "visible" }}
                            />
                          );
                        }

                        // Otherwise, render a Droppable for this timeslot
                        return (
                          <Droppable
                            key={timeIndex}
                            droppableId={`calendar|${dateStr}|${time}`}
                            isDropDisabled={Boolean(scheduledActivity)}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`h-16 border-b border-gray-200 last:border-b-0 relative ${
                                  snapshot.isDraggingOver
                                    ? "bg-blue-50 border-2 border-dashed border-blue-300"
                                    : ""
                                }`}
                                style={{ overflow: "visible" }}
                              >
                                {scheduledActivity && scheduledActivity.isStart ? (
                                  <div
                                    className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                                    style={{
                                      height: `calc(${
                                        scheduledActivity.totalSlots
                                      } * 4rem - 0.5rem)`,
                                      top: "0.25rem",
                                      backgroundColor:
                                        activityTypes[
                                          scheduledActivity.type
                                        ]?.color || "#4285F4",
                                      color: "white",
                                    }}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="font-medium text-sm text-black">
                                        {scheduledActivity.name}
                                      </div>
                                      <button
                                        onClick={() =>
                                          removeActivity(dateStr, time)
                                        }
                                        className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-black/10"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>

                                    {/* Location, time range, type */}
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
                                        <span>
                                          {
                                            activityTypes[
                                              scheduledActivity.type
                                            ]?.name
                                          }
                                        </span>
                                      </div>
                                    </div>

                                    {/* Optionally show description if enough slots */}
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
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ─── Activities Panel ─── */}
          <div className="bg-white rounded-lg border max-h-[calc(100vh-300px)] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Available Activities
                </h2>
                <p className="text-sm text-black">
                  Drag activities to the calendar to schedule them
                </p>
              </div>

              {/* ➕ Add Activity button (opens the modal) */}
              <Button
                size="sm"
                className="bg-white text-black border border-gray-300 hover:bg-gray-100"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <Droppable droppableId="activities" isDropDisabled={false}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-4 grid grid-cols-2 gap-4 flex-1 overflow-y-auto"
                >
                  {availableActivities.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-black">
                      No available activities. Remove activities from the
                      calendar to return them here.
                    </div>
                  ) : (
                    availableActivities.map((activity, index) => (
                      <Draggable
                        key={activity.id}
                        draggableId={activity.id}
                        index={index}
                      >
                        {(prov, snapshot) => (
                          <ActivityCard
                            activity={activity}
                            isDraggable={true}
                            innerRef={prov.innerRef}
                            draggableProps={prov.draggableProps}
                            dragHandleProps={prov.dragHandleProps}
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

      {/* ─── “Add Activity” MODAL ─── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">New Activity</h3>

            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />

            <input
              type="text"
              placeholder="Location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            />

            <select
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              {durationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Tag picker */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(activityTypes).map(([key, { name, color }]) => (
                <button
                  key={key}
                  onClick={() => setNewTag(key as keyof typeof activityTypes)}
                  className={`px-3 py-1 rounded text-xs ${
                    key === newTag ? "bg-amber-200" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  style={{ borderColor: color }}
                >
                  {name}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border rounded p-2 text-sm h-20"
            />

            {/* Dialog actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveNewActivity} disabled={!newTitle.trim()}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
