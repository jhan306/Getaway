"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    id: string;
    name: string;
    image: string;
    duration: string;
    location: string;
    description: string;
    type: string;
    physicalRating?: number;
    scenicRating?: number;
    culturalRating?: number;
  };
  className?: string;
  isDraggable?: boolean;
  dragHandleProps?: any;
  draggableProps?: any;
  innerRef?: any;
}

export function ActivityCard({
  activity,
  className,
  isDraggable = false,
  dragHandleProps,
  draggableProps,
  innerRef,
}: ActivityCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Parse duration string to get min and max hours
  const parseDuration = (durationStr: string) => {
    const match = durationStr.match(/(\d+)/);
    if (match && match[1]) {
      const hours = Number.parseInt(match[1], 10);
      return { min: Math.max(1, hours - 0.5), max: hours + 0.5 };
    }
    return { min: 1, max: 2 }; // Default range
  };

  const { min, max } = parseDuration(activity.duration);

  // Default ratings if not provided
  const physicalRating = activity.physicalRating || 3;
  const scenicRating = activity.scenicRating || 4;
  const culturalRating = activity.culturalRating || 3;

  // Generate star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={cn(
              "mr-0.5",
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            )}
          />
        ))}
      </div>
    );
  };

  // Get activity type color
  const getActivityTypeColor = (type: string) => {
    const activityTypes: Record<string, string> = {
      sightseeing: "#4285F4", // Blue
      food: "#34A853", // Green
      tour: "#EA4335", // Red
      leisure: "#FBBC05", // Yellow
      cultural: "#9C27B0", // Purple
      outdoor: "#009688", // Teal
      transport: "#607D8B", // Blue-grey
      accommodation: "#FF9800", // Orange
    };
    return activityTypes[type] || "#4285F4";
  };

  // Handle card click to flip it
  const handleCardClick = () => {
    if (!isDraggable) {
      setIsFlipped(!isFlipped);
    }
  };

  // For draggable cards, we need to apply the drag handle props to the card content
  // but still allow clicking on the card to flip it when not dragging
  const cardContent = (
    <>
      {/* Front of card */}
      <div
        className={`absolute inset-0 w-full h-full backface-hidden border rounded-md overflow-hidden bg-white shadow-sm ${
          isFlipped ? "hidden" : ""
        }`}
      >
        <div className="relative h-48 bg-gray-100">
          <div
            className="absolute top-0 left-0 w-full h-1"
            style={{ backgroundColor: getActivityTypeColor(activity.type) }}
          ></div>
          <Image
            src={activity.image || "/placeholder.svg"}
            alt={activity.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-3">
          <div className="font-medium text-center text-black">
            {activity.name}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 text-xs text-black">
              <MapPin className="h-3 w-3 text-black" />
              <span>{activity.location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-black">
              <Clock className="h-3 w-3 text-black" />
              <span>{activity.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back of card */}
      <div
        className={`absolute inset-0 w-full h-full backface-hidden border rounded-md overflow-hidden bg-blue-100 shadow-sm ${
          !isFlipped ? "hidden" : ""
        }`}
      >
        <div className="p-4 flex flex-col h-full justify-between">
          <div className="space-y-4">
            <h3 className="text-center font-medium text-lg text-black">
              {activity.name}
            </h3>

            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-black">
                  Physical Activity
                </p>
                {renderStars(physicalRating)}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-black">Scenic Value</p>
                {renderStars(scenicRating)}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-black">
                  Cultural Significance
                </p>
                {renderStars(culturalRating)}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-black">Duration</p>
              <p className="text-sm text-black">
                {min} - {max} hours
              </p>
            </div>
          </div>

          <div className="text-xs text-center text-black mt-2">
            Click to flip back
          </div>
        </div>
      </div>
    </>
  );

  // If the card is draggable, we need to apply the drag handle props to the card content
  if (isDraggable) {
    return (
      <div
        ref={innerRef}
        {...draggableProps}
        className={cn(
          "relative h-64 w-full cursor-grab active:cursor-grabbing",
          className
        )}
      >
        <div {...dragHandleProps} className="h-full w-full">
          {cardContent}
        </div>
      </div>
    );
  }

  // For non-draggable cards, we can simply make the whole card clickable
  return (
    <div
      className={cn("relative h-64 w-full cursor-pointer", className)}
      onClick={handleCardClick}
    >
      {cardContent}
    </div>
  );
}
