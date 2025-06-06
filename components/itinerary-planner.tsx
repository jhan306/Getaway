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
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

// ─── ACTIVITY + TRIP TYPES ─────────────────────────────────────────────────────
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

type TripState = {
  id: string;
  name: string;
  flag: string;
  available: Activity[];
  scheduled: ScheduledMap;
};

// ─── ACTIVITY TYPE DEFINITIONS ────────────────────────────────────────────────
const activityTypes = {
  sightseeing:   { name: "Sightseeing",   color: "#4285F4" },
  food:         { name: "Food & Dining", color: "#34A853" },
  tour:         { name: "Tours",         color: "#EA4335" },
  leisure:      { name: "Leisure",       color: "#FBBC05" },
  cultural:     { name: "Cultural",      color: "#9C27B0" },
  outdoor:      { name: "Outdoor",       color: "#009688" },
  transport:    { name: "Transport",     color: "#607D8B" },
  accommodation:{ name: "Accommodation", color: "#FF9800" },
};

// ─── DEFAULT ACTIVITIES FOR EACH COUNTRY ───────────────────────────────────────
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
    // …and so on (copy whatever you already have) …
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
  // …”japan” and “france” as before…
};

// ─── TIME SLOTS FOR THE CALENDAR ───────────────────────────────────────────────
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

// ─── HELPER: MAP A LOWERCASED COUNTRY → FLAG EMOJI ─────────────────────────────
function tripFlag(id: string) {
  if (id === "japan") return "🇯🇵";
  if (id === "italy") return "🇮🇹";
  if (id === "france") return "🇫🇷";
  if (id === "greece") return "🇬🇷";
  return "🗺️";
}

// ─── HELPER: FORMAT A TIME RANGE GIVEN A START & DURATION ────────────────────
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

// ─── “LOCAL‐ONLY” MAKER FOR A TRIP OBJECT ──────────────────────────────────────
//    Only used if Supabase does not have a saved itinerary yet.
const makeTrip = (id: string, name: string, country_id: string): TripState => ({
  id,
  name,
  flag: tripFlag(country_id),
  available: [
    ...(activitiesByCountry[country_id as keyof typeof activitiesByCountry] || []),
  ],
  scheduled: {},
});

export default function ItineraryPlanner({
  countryId = "greece",
  initialName,
  initialTripId,
}: {
  countryId?: string;
  initialName?: string;
  initialTripId: string;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);

  // ── State for the single Trip we’re editing ─────────────────────────────────
  const [tripState, setTripState] = useState<TripState | null>(null);

  // ── Local “Add Activity” modal state ────────────────────────────────────────
  const [isAddOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDuration, setNewDuration] = useState("1 hour");
  const [newTag, setNewTag] = useState<keyof typeof activityTypes>("sightseeing");
  const [newDescription, setNewDescription] = useState("");

  // ────────────────────────────────────────────────────────────────────────────
  // 1) ON MOUNT: Fetch the saved itinerary JSON from Supabase for `initialTripId`.
  //    If it doesn’t exist (or `itinerary_json` is empty), we fall back to a brand‐new Trip.
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadTripFromDB() {
      setLoading(true);
      const supabase: SupabaseClient<any> = createPagesBrowserClient();

      // We assume `itinerary_json` is a JSONB column on `trips` that looks like:
      // {
      //   "available": [<Activity>…],
      //   "scheduled": { "<YYYY-MM-DD>-<TIMESLOT>": { … } … }
      // }
      const { data, error } = await supabase
        .from("trips")
        .select("id, name, country_id, flag, itinerary_json")
        .eq("id", initialTripId)
        .single();

      if (error || !data) {
        toast.toast({
          title: "Failed to load trip",
          description: error?.message ?? "Unknown error",
          variant: "destructive",
        });
        // Fallback: build a fresh TripState from `initialName` and `countryId`
        const fallbackName = initialName?.trim() || countryId;
        const fallback = makeTrip(initialTripId, fallbackName, countryId);
        setTripState(fallback);
        setLoading(false);
        return;
      }

      // If `itinerary_json` is present, use it. Otherwise, fall back again.
      const savedItinerary = (data.itinerary_json as any) ?? null;

      if (savedItinerary
        && Array.isArray(savedItinerary.available)
        && typeof savedItinerary.scheduled === "object"
      ) {
        // We already have:
        //   savedItinerary.available: Activity[]
        //   savedItinerary.scheduled: Record<string, any>
        setTripState({
          id: data.id,
          name: data.name,
          flag: data.flag,
          available: savedItinerary.available,
          scheduled: savedItinerary.scheduled,
        });
        setLoading(false);
        return;
      }

      // If `itinerary_json` is missing or malformed, build a fresh TripState:
      const fallbackTrip = makeTrip(data.id, data.name, data.country_id);
      setTripState(fallbackTrip);
      setLoading(false);
    }

    loadTripFromDB();
  }, [initialTripId, countryId, initialName, toast]);

  if (loading || !tripState) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Helper to update our local TripState and persist it (itinerary_json) back to Supabase
  // ────────────────────────────────────────────────────────────────────────────
  const updateAndSaveTrip = async (newState: Partial<TripState>) => {
    if (!tripState) return;
    // 1) Update local copy
    const updated: TripState = { ...tripState, ...newState };
    setTripState(updated);

    // 2) Persist back to Supabase
    try {
      const supabase: SupabaseClient<any> = createPagesBrowserClient();
      await supabase
        .from("trips")
        .update({ itinerary_json: { 
          available: updated.available, 
          scheduled: updated.scheduled 
        }})
        .eq("id", tripState.id);
      // (We don’t strictly need the return value; assume success or catch below)
    } catch (err) {
      console.error("Failed to save itinerary:", err);
      toast.toast({
        title: "Failed to save itinerary",
        description: "Your changes may not persist. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Aliases for “available” & “scheduled” data
  const availableActivities = tripState.available;
  const scheduledActivities = tripState.scheduled;

  // ────────────────────────────────────────────────────────────────────────────
  // “Add Activity” modal → insert a brand‐new Activity into available array,
  // then call updateAndSaveTrip({ available: [...] })
  // ────────────────────────────────────────────────────────────────────────────
  const saveNewActivity = () => {
    if (!newTitle.trim()) return;
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: newTitle.trim(),
      image: "/placeholder.svg?height=200&width=300",
      duration: newDuration,
      location: newLocation.trim() || "Unknown",
      description: newDescription.trim(),
      type: newTag,
      physicalRating: 1,
      scenicRating: 1,
      culturalRating: 1,
    };
    const newAvailList = [...availableActivities, newActivity];
    updateAndSaveTrip({ available: newAvailList });

    // reset + close modal
    setNewTitle("");
    setNewLocation("");
    setNewDuration("1 hour");
    setNewTag("sightseeing");
    setNewDescription("");
    setAddOpen(false);
  };

  // Whenever `countryId` changes, we want to re-initialize only if we never loaded from DB.
  // (In most cases, `countryId` is fixed once the trip is created.)
  useEffect(() => {
    if (!tripState) return;
    // If our trip came back from DB with a matching country, do nothing.
    // Otherwise, fall back to fresh “available” set:
    if (tripState.available.length === 0) {
      const freshAvail = [
        ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || []),
      ];
      updateAndSaveTrip({ available: freshAvail, scheduled: {} });
    }
  }, [countryId]);

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers for the calendar: generate 3 consecutive days, formatDate, parseDuration
  // ────────────────────────────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarDates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + i);
    return d;
  });
  const formatDate = (date: Date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const day = days[date.getDay()];
    const dateNum = date.getDate().toString().padStart(2, "0");
    return { day, dateNum };
  };
  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+(?:\.\d+)?)/);
    if (match && match[1]) return Number.parseInt(match[1], 10);
    return 1;
  };

  // Check if a block of slots is free
  const areTimeSlotsAvailable = (
    dateStr: string,
    startTimeSlot: string,
    durationHours: number
  ) => {
    const startIndex = timeSlots.indexOf(startTimeSlot);
    if (startIndex === -1) return false;
    if (startIndex + durationHours > timeSlots.length) return false;
    for (let i = 0; i < durationHours; i++) {
      const t = timeSlots[startIndex + i];
      if (scheduledActivities[`${dateStr}-${t}`]) return false;
    }
    return true;
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Handle drag‐and‐drop into calendar: remove from “available,” add to “scheduled”
  // ────────────────────────────────────────────────────────────────────────────
  const onDragEnd = (result: any) => {
    const { destination, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId.startsWith("calendar|")) {
      const [, dateStr, timeSlot] = destination.droppableId.split("|");
      const activityIndex = availableActivities.findIndex(
        (a) => a.id === draggableId
      );
      if (activityIndex === -1) return;

      const activity = availableActivities[activityIndex];
      const durationHours = parseDuration(activity.duration);

      // If not enough free slots, show toast and abort
      if (!areTimeSlotsAvailable(dateStr, timeSlot, durationHours)) {
        toast.toast({
          title: "Cannot schedule activity",
          description: `Not enough free time slots for ${activity.name} (${activity.duration})`,
          variant: "destructive",
        });
        return;
      }

      // Remove that activity from availableActivities:
      const newAvail = [...availableActivities];
      newAvail.splice(activityIndex, 1);

      // Build new scheduled object
      const newSched: ScheduledMap = { ...scheduledActivities };
      const startIndex = timeSlots.indexOf(timeSlot);
      const timeRange = formatTimeRange(timeSlot, durationHours);

      for (let i = 0; i < durationHours; i++) {
        const tslot = timeSlots[startIndex + i];
        newSched[`${dateStr}-${tslot}`] = {
          ...activity,
          isStart: i === 0,
          isEnd: i === durationHours - 1,
          position: i,
          totalSlots: durationHours,
          timeRange,
        };
      }

      updateAndSaveTrip({ available: newAvail, scheduled: newSched });

      toast.toast({
        title: "Activity scheduled",
        description: `${activity.name} added to ${timeSlot} on ${dateStr}`,
      });
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Remove a multi‐slot activity from the calendar: return it to “available”
  // ────────────────────────────────────────────────────────────────────────────
  const removeActivity = (dateStr: string, timeSlot: string) => {
    const key = `${dateStr}-${timeSlot}`;
    const activity = scheduledActivities[key];
    if (!activity) return;

    // Reconstruct “original” Activity
    const original: Activity = {
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

    // Put it back in “available”
    const newAvail = [...availableActivities, original];

    // Remove all occupied slots
    const { position, totalSlots } = activity;
    const startIndex = timeSlots.indexOf(timeSlot) - position;
    const newSched: ScheduledMap = { ...scheduledActivities };

    for (let i = 0; i < totalSlots; i++) {
      const tslot = timeSlots[startIndex + i];
      delete newSched[`${dateStr}-${tslot}`];
    }

    updateAndSaveTrip({ available: newAvail, scheduled: newSched });
    toast.toast({
      title: "Activity removed",
      description: `${activity.name} has been removed from your itinerary`,
    });
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Move calendar backward / forward by 3 days
  // ────────────────────────────────────────────────────────────────────────────
  const previousDays = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 3);
    setCurrentDate(d);
  };
  const nextDays = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 3);
    setCurrentDate(d);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // “Reset” puts all default country activities back into available, clears scheduled
  // ────────────────────────────────────────────────────────────────────────────
  const resetItinerary = () => {
    const freshAvail = [
      ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] || []),
    ];
    updateAndSaveTrip({ available: freshAvail, scheduled: {} });
    toast.toast({
      title: "Itinerary reset",
      description: "All activities returned to available list",
    });
  };

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-6">
      {/* ─── Show trip’s flag & name ─── */}
      <div className="flex items-center gap-2">
        <span className="text-3xl">{tripState.flag}</span>
        <h2 className="text-2xl font-semibold">{tripState.name}</h2>
      </div>

      {/* ─── Legend ─── */}
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

      {/* ─── Reset Itinerary ─── */}
      <div className="flex justify-between mb-4">
        <Button
          onClick={resetItinerary}
          className="bg-white text-black border border-gray-300 hover:bg-gray-100"
        >
          Reset Itinerary
        </Button>
      </div>

      {/* ─── “Switch Trip” BAR (if you ever store multiple TripStates in memory) ─── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => {
            /* In most simple cases, you only have one Trip → no switching needed */
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-amber-200"
          )}
          style={{ cursor: "default" }}
        >
          <span>{tripState.flag}</span>
          <span className="text-black font-medium">{tripState.name}</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* ─── Calendar View ─── */}
          <Card className="bg-white">
            <CardContent className="p-0 overflow-auto">
              {/* Navigation */}
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

              {/* Header row: Day labels */}
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

              {/* Timeslot rows */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] bg-white">
                {/* Time Labels */}
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

                {/* One column per day */}
                {calendarDates.map((date, dateIndex) => {
                  const dateStr = date.toISOString().split("T")[0];
                  return (
                    <div
                      key={dateIndex}
                      className="border-r border-gray-200 last:border-r-0"
                    >
                      {timeSlots.map((time, timeIndex) => {
                        const cellKey = `${dateStr}-${time}`;
                        const schedActivity = scheduledActivities[cellKey];

                        // If this slot is part of a multi‐slot activity but not the “start,” skip
                        if (schedActivity && !schedActivity.isStart && schedActivity.position > 0) {
                          return (
                            <div
                              key={timeIndex}
                              className="h-16 border-b border-gray-200 last:border-b-0 relative"
                              style={{ overflow: "visible" }}
                            />
                          );
                        }

                        // Otherwise, render a Droppable
                        return (
                          <Droppable
                            key={timeIndex}
                            droppableId={`calendar|${dateStr}|${time}`}
                            isDropDisabled={Boolean(schedActivity)}
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
                                {schedActivity && schedActivity.isStart ? (
                                  <div
                                    className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                                    style={{
                                      height: `calc(${
                                        schedActivity.totalSlots
                                      } * 4rem - 0.5rem)`,
                                      top: "0.25rem",
                                      backgroundColor:
                                        activityTypes[schedActivity.type]?.color || "#4285F4",
                                      color: "white",
                                    }}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="font-medium text-sm text-black">
                                        {schedActivity.name}
                                      </div>
                                      <button
                                        onClick={() => removeActivity(dateStr, time)}
                                        className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-black/10"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>

                                    {/* Activity details */}
                                    <div className="mt-1 flex flex-col gap-1">
                                      <div className="flex items-center gap-1 text-black text-xs">
                                        <MapPin className="h-3 w-3 text-black" />
                                        <span>{schedActivity.location}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-black text-xs">
                                        <Clock className="h-3 w-3 text-black" />
                                        <span>{schedActivity.timeRange}</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-black text-xs">
                                        <Tag className="h-3 w-3 text-black" />
                                        <span>
                                          {activityTypes[schedActivity.type]?.name}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Show description if it spans ≥3 slots */}
                                    {schedActivity.totalSlots >= 3 && (
                                      <div className="mt-2 text-black text-xs line-clamp-2">
                                        {schedActivity.description}
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

              {/* ➕ Add Activity button */}
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
                      No available activities. Remove activities from the calendar to return them here.
                    </div>
                  ) : (
                    availableActivities.map((activity, idx) => (
                      <Draggable key={activity.id} draggableId={activity.id} index={idx}>
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
