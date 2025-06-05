import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

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

function formatDate(date: Date) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const day = days[date.getDay()];
  const dateNum = date.getDate().toString().padStart(2, "0");
  return { day, dateNum };
}

export default function ReadOnlyItinerary({ trip }: { trip: any }) {
  // Generate dates for the calendar view (3 days starting from today)
  const [currentDate] = [new Date()];
  const calendarDates = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });
  const scheduledActivities = trip.scheduled || {};

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
      <Card className="bg-white">
        <CardContent className="p-0 overflow-auto">
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
                  <div className="text-3xl font-bold text-black">{dateNum}</div>
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
                    // Skip rendering for slots that are part of a multi-slot activity but not the start
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
                      <div
                        key={timeIndex}
                        className="h-16 border-b border-gray-200 last:border-b-0 relative"
                        style={{ overflow: "visible" }}
                      >
                        {scheduledActivity && scheduledActivity.isStart ? (
                          <div
                            className="absolute left-1 right-1 rounded p-2 text-xs overflow-hidden flex flex-col z-10"
                            style={{
                              height: `calc(${
                                scheduledActivity.totalSlots * 4
                              }rem - 0.5rem)`,
                              top: "0.25rem",
                              backgroundColor:
                                activityTypes[scheduledActivity.type]?.color ||
                                "#4285F4",
                              color: "white",
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-sm text-black">
                                {scheduledActivity.name}
                              </div>
                            </div>
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
                                  {activityTypes[scheduledActivity.type]
                                    ?.name || "Activity"}
                                </span>
                              </div>
                            </div>
                            {scheduledActivity.totalSlots >= 3 && (
                              <div className="mt-2 text-black text-xs line-clamp-2">
                                {scheduledActivity.description}
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
