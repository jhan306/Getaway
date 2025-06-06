// components/itinerary-planner.tsx
"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, X, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ActivityCard } from "@/components/activity-card";
import { cn } from "@/lib/utils";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";

// ─── ACTIVITY TYPE DEFINITIONS ────────────────────────────────────────────────
const activityTypes = {
  sightseeing: { name: "Sightseeing", color: "#4285F4" },
  food: { name: "Food & Dining", color: "#34A853" },
  tour: { name: "Tours", color: "#EA4335" },
  leisure: { name: "Leisure", color: "#FBBC05" },
  cultural: { name: "Cultural", color: "#9C27B0" },
  outdoor: { name: "Outdoor", color: "#009688" },
  transport: { name: "Transport", color: "#607D8B" },
  accommodation: { name: "Accommodation", color: "#FF9800" },
};

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

// ─── DEFAULT ACTIVITIES FOR KNOWN COUNTRIES ─────────────────────────────────
const activitiesByCountry: Record<string, Activity[]> = {
  greece: [
    {
      id: "activity-1",
      name: "Parthenon",
      image: "/images/parthenon.jpg",
      duration: "2 hours",
      location: "Athens",
      description: "Visit the iconic Parthenon.",
      type: "sightseeing",
      physicalRating: 3,
      scenicRating: 5,
      culturalRating: 5,
    },
    // …etc. seed more activities as needed…
  ],
  // Add “italy”, “japan”, “france” etc. similarly…
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
  return (
    `${rawHour}:${rawMin.padEnd(2, "0")}${startPeriod} - ` +
    `${endHour}:${rawMin.padEnd(2, "0")}${endPeriod}`
  );
};

// ─── HELPER: MAP A COUNTRY ID → FLAG EMOJI ────────────────────────────────────
function tripFlag(id: string) {
  if (id === "greece") return "🇬🇷";
  if (id === "italy") return "🇮🇹";
  if (id === "japan") return "🇯🇵";
  if (id === "france") return "🇫🇷";
  return "🗺️";
}

export default function ItineraryPlanner({
  countryId = "",
  initialName,
  initialTripId,
  initialItineraryJSON,
}: {
  countryId?: string;
  initialName?: string;
  initialTripId: string;
  initialItineraryJSON: {
    available: Activity[];
    scheduled: ScheduledMap;
  } | null;
}) {
  const { toast } = useToast();

  // ─── 1) Declare all hooks at the top, unconditionally ─────────────────────
  const [loading, setLoading] = useState<boolean>(true);
  const [tripState, setTripState] = useState<TripState | null>(null);

  // Modal state (Add Activity)
  const [isAddOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDuration, setNewDuration] = useState("1 hour");
  const [newTag, setNewTag] =
    useState<keyof typeof activityTypes>("sightseeing");
  const [newDescription, setNewDescription] = useState("");

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  // ────────────────────────────────────────────────────────────────────────────

  // ─── 2) ON MOUNT: initialize from props (no extra fetch inside this component) ───
  useEffect(() => {
    if (!initialTripId) {
      setLoading(false);
      return;
    }

    if (
      initialItineraryJSON &&
      Array.isArray(initialItineraryJSON.available) &&
      typeof initialItineraryJSON.scheduled === "object"
    ) {
      setTripState({
        id: initialTripId,
        name: initialName ?? "",
        flag: tripFlag(countryId || ""),
        available: initialItineraryJSON.available,
        scheduled: initialItineraryJSON.scheduled,
      });
    } else {
      // Brand‐new trip (no saved JSON)
      setTripState({
        id: initialTripId,
        name: initialName ?? "",
        flag: tripFlag(countryId || ""),
        available: activitiesByCountry[countryId] || [],
        scheduled: {},
      });
    }

    setLoading(false);
  }, [initialTripId, countryId, initialName, initialItineraryJSON]);
  // ────────────────────────────────────────────────────────────────────────────

  // ─── 3) saveItinerary(): updates state & persists to Supabase ─────────────────
  async function saveItinerary(
    newAvailable: Activity[],
    newScheduled: ScheduledMap
  ) {
    if (!tripState) return;

    // 3a) Update local state immediately
    setTripState({
      ...tripState,
      available: newAvailable,
      scheduled: newScheduled,
    });

    // 3b) Persist to Supabase
    const supabase: SupabaseClient<any> = createPagesBrowserClient();
    const { error } = await supabase
      .from("trips")
      .update({
        itinerary_json: {
          available: newAvailable,
          scheduled: newScheduled,
        },
      })
      .eq("id", tripState.id);

    if (error) {
      console.error("Error saving itinerary:", error);
      toast({
        title: "Failed to save itinerary",
        description: "Your changes may not persist. Please try again.",
        variant: "destructive",
      });
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ─── 4) Secondary effect: whenever countryId changes, re‐initialize if “available” is empty ───

  useEffect(() => {
    if (!tripState) return;

    // Only if there are currently zero “available” activities…
    if (tripState.available.length === 0) {
      const freshAvail = activitiesByCountry[countryId] || [];

      // …and only if that default list is non‐empty, seed it once:
      if (freshAvail.length > 0) {
        saveItinerary(freshAvail, {});
      }
    }
  }, [countryId, tripState]);
  // ────────────────────────────────────────────────────────────────────────────

  // ─── 5) Early render‐block: show spinner if still loading or no tripState ───────────────
  if (loading || !tripState) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────────────
  // Aliases for available/scheduled
  const availableActivities = tripState.available;
  const scheduledActivities = tripState.scheduled;
  // ────────────────────────────────────────────────────────────────────────────

  // ─── 6) “Add New Activity” handler → append to available + save ─────────────────────
  const saveNewActivity = async () => {
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
    await saveItinerary(newAvailList, scheduledActivities);

    // Reset modal fields & close
    setNewTitle("");
    setNewLocation("");
    setNewDuration("1 hour");
    setNewTag("sightseeing");
    setNewDescription("");
    setAddOpen(false);
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────────────
  // Calendar‐helper functions
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
    if (match && match[1]) return parseInt(match[1], 10);
    return 1;
  };

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

  // ────────────────────────────────────────────────────────────────────────────
  // Handle drag & drop → schedule an activity & save
  const onDragEnd = async (result: any) => {
    const { destination, draggableId } = result;
    if (!destination || !tripState) return;

    if (destination.droppableId.startsWith("calendar|")) {
      const [, dateStr, timeSlot] = destination.droppableId.split("|");
      const activityIndex = availableActivities.findIndex(
        (a) => a.id === draggableId
      );
      if (activityIndex === -1) return;

      const activity = availableActivities[activityIndex];
      const durationHours = parseDuration(activity.duration);

      if (!areTimeSlotsAvailable(dateStr, timeSlot, durationHours)) {
        toast({
          title: "Cannot schedule activity",
          description: `Not enough available time slots for ${activity.name} (${activity.duration})`,
          variant: "destructive",
        });
        return;
      }

      const newAvailable = [...availableActivities];
      newAvailable.splice(activityIndex, 1);

      const newScheduled: ScheduledMap = { ...scheduledActivities };
      const startIndex = timeSlots.indexOf(timeSlot);
      const timeRange = formatTimeRange(timeSlot, durationHours);

      for (let i = 0; i < durationHours; i++) {
        const slot = timeSlots[startIndex + i];
        newScheduled[`${dateStr}-${slot}`] = {
          ...activity,
          isStart: i === 0,
          isEnd: i === durationHours - 1,
          position: i,
          totalSlots: durationHours,
          timeRange,
        };
      }

      await saveItinerary(newAvailable, newScheduled);

      toast({
        title: "Activity scheduled",
        description: `${activity.name} (${activity.duration}) added at ${timeSlot}`,
      });
    }
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────────────
  // Remove a multi-slot activity: return it to available & save
  const removeActivity = async (dateStr: string, timeSlot: string) => {
    if (!tripState) return;
    const key = `${dateStr}-${timeSlot}`;
    const activity = scheduledActivities[key];
    if (!activity) return;

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

    const newAvailable = [...availableActivities, original];
    const { position, totalSlots } = activity;
    const startIndex = timeSlots.indexOf(timeSlot) - position;
    const newScheduled = { ...scheduledActivities };

    for (let i = 0; i < totalSlots; i++) {
      const slot = timeSlots[startIndex + i];
      delete newScheduled[`${dateStr}-${slot}`];
    }

    await saveItinerary(newAvailable, newScheduled);

    toast({
      title: "Activity removed",
      description: `${activity.name} removed from itinerary`,
    });
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────────────
  // Calendar navigation handlers
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

  // ────────────────────────────────────────────────────────────────────────────
  // Reset itinerary: restore default country activities
  const resetItinerary = async () => {
    const freshAvail = activitiesByCountry[countryId] || [];
    await saveItinerary(freshAvail, {});
    toast({
      title: "Itinerary reset",
      description: "All activities returned to the available list",
    });
  };
  // ────────────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────────────
  // FINAL RENDER
  return (
    <div className="flex flex-col space-y-6">
      {/* Trip’s flag & name */}
      <div className="flex items-center gap-2">
        <span className="text-3xl">{tripState.flag}</span>
        <h2 className="text-2xl font-semibold">{tripState.name}</h2>
      </div>

      {/* Legend */}
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

      {/* Reset Itinerary */}
      <div className="flex justify-between mb-4">
        <Button
          onClick={resetItinerary}
          className="bg-white text-black border border-gray-300 hover:bg-gray-100"
        >
          Reset Itinerary
        </Button>
      </div>

      {/* Single-trip selector/banner */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-200",
            "cursor-default"
          )}
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

              {/* Day labels */}
              <div className="grid grid-cols-3 border-b border-gray-200 bg-white">
                {calendarDates.map((date, idx) => {
                  const { day, dateNum } = formatDate(date);
                  return (
                    <div
                      key={idx}
                      className="text-center py-4 border-r border-gray-200 last:border-r-0"
                    >
                      <div className="text-sm text-black">{day}</div>
                      <div className="text-3xl font-bold text-black">
                        {dateNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time-slot rows */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] bg-white">
                {/* Time labels */}
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

                        // If part of a multi-slot activity but not the start, skip rendering
                        if (
                          scheduledActivity &&
                          !scheduledActivity.isStart &&
                          scheduledActivity.position > 0
                        ) {
                          return (
                            <div
                              key={timeIndex}
                              className="h-16 border-b border-gray-200 last:border-b-0 relative"
                            />
                          );
                        }

                        return (
                          <Droppable
                            key={timeIndex}
                            droppableId={`calendar|${dateStr}|${time}`}
                            isDropDisabled={Boolean(scheduledActivity)}
                            isCombineEnabled={false}
                            ignoreContainerClipping={false}
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
                                {scheduledActivity &&
                                  scheduledActivity.isStart && (
                                    <div
                                      className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                                      style={{
                                        height: `calc(${scheduledActivity.totalSlots} * 4rem - 0.5rem)`,
                                        top: "0.25rem",
                                        backgroundColor:
                                          activityTypes[scheduledActivity.type]
                                            ?.color || "#4285F4",
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
                                          <span>
                                            {scheduledActivity.location}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-black text-xs">
                                          <Clock className="h-3 w-3 text-black" />
                                          <span>
                                            {scheduledActivity.timeRange}
                                          </span>
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
                                      {/* Description if it spans ≥3 slots */}
                                      {scheduledActivity.totalSlots >= 3 && (
                                        <div className="mt-2 text-black text-xs line-clamp-2">
                                          {scheduledActivity.description}
                                        </div>
                                      )}
                                    </div>
                                  )}
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
          <div
            key="activities-panel"
            className="bg-white rounded-lg border max-h-[calc(100vh-300px)] flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">
                  Available Activities
                </h2>
                <p className="text-sm text-black">
                  Drag activities to the calendar to schedule them
                </p>
              </div>

              {/* ➕ Add Activity */}
              <Button
                size="sm"
                className="bg-white text-black border border-gray-300 hover:bg-gray-100"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>

            <Droppable
              droppableId="activities"
              isDropDisabled={false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "p-4 grid grid-cols-2 gap-4 flex-1 overflow-y-auto",
                    snapshot.isDraggingOver && "bg-blue-50"
                  )}
                >
                  {availableActivities.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-black">
                      No available activities. Remove from calendar to return
                      here.
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
              {["1 hour", "2 hours", "3 hours", "4 hours"].map((opt) => (
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
                    key === newTag
                      ? "bg-amber-200"
                      : "bg-gray-100 hover:bg-gray-200"
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveNewActivity}
                disabled={!newTitle.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
