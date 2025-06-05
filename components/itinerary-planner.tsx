"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, X, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ActivityCard } from "@/components/activity-card";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

// Sample destination data
const destinations = [
  { id: "greece", name: "Sample Greece Itinerary", flag: "🇬🇷" },
  { id: "italy", name: "Italy", flag: "🇮🇹" },
  { id: "japan", name: "Japan", flag: "🇯🇵" },
  { id: "france", name: "France", flag: "🇫🇷" },
];
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
  isPublic?: boolean;
};

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
};

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
];

const tripFlag = (id: string) =>
  id === "japan"
    ? "🇯🇵"
    : id === "italy"
    ? "🇮🇹"
    : id === "france"
    ? "🇫🇷"
    : id === "greece"
    ? "🇬🇷"
    : "🗺️";

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
  return `${rawHour}:${rawMin.padEnd(
    2,
    "0"
  )}${startPeriod} - ${endHour}:${rawMin.padEnd(2, "0")}${endPeriod}`;
};

const makeTrip = (name: string, startActivities: Activity[] = []): Trip => ({
  id: crypto.randomUUID(),
  name,
  flag: tripFlag(name.toLowerCase()),
  available: [...startActivities],
  scheduled: {},
  isPublic: false,
});

export default function ItineraryPlanner({
  countryId = "greece",
}: {
  countryId?: string;
}) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());

  // ----- Trip state -------------------------------------------
  const initialAvail = [
    ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] ||
      []),
  ];
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isAddOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDuration, setNewDuration] = useState("1 hour");
  const [newTag, setNewTag] =
    useState<keyof typeof activityTypes>("sightseeing");
  const [newDescription, setNewDescription] = useState("");

  const currentTrip = trips.find((t) => t.id === currentId) as Trip;

  const updateTrip = (partial: Partial<Trip>) =>
    setTrips((prev) =>
      prev.map((t) => (t.id === currentId ? { ...t, ...partial } : t))
    );

  // alias shortcuts the rest of the code already expects
  const {
    available: availableActivities = [],
    scheduled: scheduledActivities = {},
    isPublic = false,
  } = currentTrip || {};
  const setAvailableActivities = (avail: Activity[]) =>
    updateTrip({ available: avail });
  const setScheduledActivities = (sched: ScheduledMap) =>
    updateTrip({ scheduled: sched });

  // Fetch trips from Supabase on mount
  useEffect(() => {
    const fetchTrips = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;
      const { data, error } = await supabase
        .from("trips")
        .select("id, name, flag, available, scheduled, is_public")
        .eq("user_id", user.data.user.id);
      if (!error && data && data.length > 0) {
        setTrips(
          data.map((t: any) => ({
            ...t,
            available: t.available || [],
            scheduled: t.scheduled || {},
            isPublic: t.is_public,
          }))
        );
        setCurrentId(data[0].id);
      } else {
        // If no trips, create a default one
        const newTrip = makeTrip(countryId, initialAvail);
        setTrips([newTrip]);
        setCurrentId(newTrip.id);
      }
    };
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle public/private for current trip
  const togglePublic = async () => {
    if (!currentTrip) return;
    const newIsPublic = !isPublic;

    // Update in Supabase
    const { error } = await supabase
      .from("trips")
      .update({
        is_public: newIsPublic,
        updated_at: new Date().toISOString(), // Add this to trigger a refresh
      })
      .eq("id", currentTrip.id);

    if (!error) {
      // Update local state
      updateTrip({ isPublic: newIsPublic });

      // Show success message
      toast({
        title: newIsPublic ? "Trip is now public" : "Trip is now private",
        description: newIsPublic
          ? "This itinerary will be visible to the community."
          : "This itinerary is now private.",
      });
    } else {
      // Show error message
      toast({
        title: "Error updating trip visibility",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ----- Add‐trip handler -------------------------------------
  const addTrip = () => {
    const name = prompt("Give your trip a name (e.g. Spain 2026)")?.trim();
    if (!name) return;
    const newTrip = makeTrip(name);
    setTrips((prev) => [...prev, newTrip]);
    setCurrentId(newTrip.id);
  };
  const saveNewActivity = () => {
    if (!newTitle.trim()) return;

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: newTitle.trim(),
      image: "/placeholder.svg?height=200&width=300", // or let users upload later
      duration: newDuration,
      location: newLocation.trim() || "Unknown",
      description: newDescription.trim(),
      type: newTag,
      physicalRating: 1,
      scenicRating: 1,
      culturalRating: 1,
    };
    setAvailableActivities([...availableActivities, newActivity]);

    // reset + close dialog
    setNewTitle("");
    setNewLocation("");
    setNewDuration("1 hour");
    setNewTag("sightseeing");
    setNewDescription("");
    setAddOpen(false);
  };

  useEffect(() => {
    setAvailableActivities([
      ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] ||
        []),
    ]);
    setScheduledActivities({});
  }, [countryId]);

  // Generate dates for the calendar view (3 days starting from current date)
  const calendarDates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Format date for display
  const formatDate = (date: Date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const day = days[date.getDay()];
    const dateNum = date.getDate().toString().padStart(2, "0");
    return { day, dateNum };
  };

  // Parse duration string to number of hours
  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+(?:\.\d+)?)/);
    if (match && match[1]) {
      return Number.parseInt(match[1], 10);
    }
    return 1; // Default to 1 hour if parsing fails
  };

  // Check if time slots are available
  const areTimeSlotsAvailable = (
    dateStr: string,
    startTimeSlot: string,
    durationHours: number
  ) => {
    const startIndex = timeSlots.indexOf(startTimeSlot);
    if (startIndex === -1) return false;

    // Check if there are enough time slots left in the day
    if (startIndex + durationHours > timeSlots.length) return false;

    // Check if any of the required slots are already occupied
    for (let i = 0; i < durationHours; i++) {
      const timeSlot = timeSlots[startIndex + i];
      if (scheduledActivities[`${dateStr}-${timeSlot}`]) return false;
    }

    return true;
  };

  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // If dropped outside a droppable area
    if (!destination) return;
    console.log("DRAG END:", result, "\nBEFORE:", scheduledActivities);

    // If dropped in the calendar
    if (destination.droppableId.startsWith("calendar|")) {
      const [, dateStr, timeSlot] = destination.droppableId.split("|");
      const activityId = result.draggableId;

      // Find the activity in available activities
      const activityIndex = availableActivities.findIndex(
        (a) => a.id === activityId
      );
      if (activityIndex === -1) return;

      const activity = availableActivities[activityIndex];
      const durationHours = parseDuration(activity.duration);

      // Check if all required time slots are available
      if (!areTimeSlotsAvailable(dateStr, timeSlot, durationHours)) {
        toast({
          title: "Cannot schedule activity",
          description: `Not enough available time slots for ${activity.name} (${activity.duration})`,
          variant: "destructive",
        });
        return;
      }

      // Remove the activity from available activities
      const newAvailableActivities = [...availableActivities];
      newAvailableActivities.splice(activityIndex, 1);

      // Schedule the activity across multiple time slots
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

      console.log("AFTER:", newScheduledActivities);

      toast({
        title: "Activity scheduled",
        description: `${activity.name} (${activity.duration}) added to your itinerary at ${timeSlot}`,
      });
    }
  };

  // Remove an activity from the schedule and return it to available activities
  const removeActivity = (dateStr: string, timeSlot: string) => {
    const activityKey = `${dateStr}-${timeSlot}`;
    const activity = scheduledActivities[activityKey];

    if (!activity) return;

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
    };

    // Add the activity back to available activities
    const newAvailableActivities = [...availableActivities, originalActivity];

    // Remove from scheduled activities
    const { position, totalSlots } = activity;
    const startIndex = timeSlots.indexOf(timeSlot) - position;
    const newScheduledActivities = { ...scheduledActivities };

    // Remove all slots occupied by this activity
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

  // Navigate to previous 3 days
  const previousDays = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 3);
    setCurrentDate(newDate);
  };

  // Navigate to next 3 days
  const nextDays = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 3);
    setCurrentDate(newDate);
  };

  // Reset the itinerary
  const resetItinerary = () => {
    setAvailableActivities([
      ...(activitiesByCountry[countryId as keyof typeof activitiesByCountry] ||
        []),
    ]);
    setScheduledActivities({});
    toast({
      title: "Itinerary reset",
      description: "All activities have been returned to the available list",
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Activity type legend */}
      <div className="mb-4 flex flex-wrap gap-3">
        {Object.entries(activityTypes).map(([key, { name, color }]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-xs text-black">{name}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={resetItinerary}
          className="bg-white text-black border border-gray-300 hover:bg-gray-100"
        >
          Reset Itinerary
        </Button>
        <div className="flex items-center gap-2">
          <span className={isPublic ? "text-green-600" : "text-gray-500"}>
            {isPublic ? "Public" : "Private"}
          </span>
          <button
            onClick={togglePublic}
            className={`w-10 h-6 rounded-full border transition-colors duration-200 focus:outline-none ${
              isPublic
                ? "bg-green-400 border-green-600"
                : "bg-gray-300 border-gray-400"
            }`}
            title={isPublic ? "Make Private" : "Make Public"}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                isPublic ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      {/* Trip selector bar */}
      <div className="flex items-center gap-4 mb-6">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setCurrentId(trip.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              trip.id === currentId
                ? "bg-amber-200"
                : "bg-gray-800 text-white/80"
            )}
          >
            <span>{trip.flag}</span>
            <span
              className={trip.id === currentId ? "text-black font-medium" : ""}
            >
              {trip.name}
            </span>
          </button>
        ))}

        {/* Add Trip */}
        <button
          onClick={addTrip}
          className="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:underline"
          title="Add new trip"
        >
          <Plus className="h-4 w-4" /> Add trip
        </button>

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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Calendar View */}
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

              {/* Calendar header */}
              <div className="grid grid-cols-3 border-b border-gray-200 bg-white">
                {calendarDates.map((date, index) => {
                  const { day, dateNum } = formatDate(date);
                  return (
                    <div
                      key={index}
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

              {/* Calendar time slots */}
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] bg-white">
                {/* Time labels */}
                <div className="border-r border-gray-200">
                  {timeSlots.map((time, index) => (
                    <div
                      key={index}
                      className="h-16 flex items-center justify-end pr-2 text-sm text-black"
                    >
                      {time}
                    </div>
                  ))}
                </div>

                {/* Calendar cells for each day */}
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

                        // Skip rendering droppable for slots that are part of a multi-slot activity but not the start
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
                                  snapshot.isDraggingOver
                                    ? "bg-blue-50 border-2 border-dashed border-blue-300"
                                    : ""
                                }`}
                                style={{ overflow: "visible" }}
                              >
                                {scheduledActivity &&
                                scheduledActivity.isStart ? (
                                  <div
                                    className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                                    style={{
                                      height: `calc(${
                                        scheduledActivity.totalSlots * 4
                                      }rem - 0.5rem)`,
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

                                    {/* Enhanced activity information display */}
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
                                          {activityTypes[scheduledActivity.type]
                                            ?.name || "Activity"}
                                        </span>
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
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Activities Panel */}
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

              {/* ➕ Add Activity */}
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
  );
}
