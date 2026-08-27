"use client";

import React, { useState } from "react";
import { ActivityListItem } from "@/components/public/ActivityListItem";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  title: string;
  slug: string;
  shortSummary: string;
  category: string;
  organization?: string | null;
  role?: string | null;
  location?: string | null;
  eventDate: string | Date;
  coverImage?: string | null;
  tags?: string | null;
}

interface ActivityListProps {
  activities: ActivityItem[];
}

export function ActivityList({ activities = [] }: ActivityListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Extract unique categories
  const categories = Array.from(
    new Set(activities.map((a) => a.category).filter(Boolean))
  );

  const filteredActivities =
    selectedCategory === "all"
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
            selectedCategory === "all"
              ? "bg-accent text-accent-foreground font-semibold shadow-sm"
              : "bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
          )}
        >
          All Activities ({activities.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              selectedCategory === cat
                ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                : "bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Itemized Directory List */}
      {filteredActivities.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          No activities found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <ActivityListItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityList;
