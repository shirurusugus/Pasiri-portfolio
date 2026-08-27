import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Building2, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ActivityListItemProps {
  activity: {
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
  };
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const year = new Date(activity.eventDate).getFullYear();

  return (
    <Link
      href={`/activities/${activity.slug}`}
      data-editable-type="activity"
      data-editable-id={activity.id}
      data-editable-title={activity.title}
      data-editable-slug={activity.slug}
      data-edit-url={`/admin/activities/${activity.id}`}
      data-add-url="/admin/activities/new"
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/70 bg-surface/40 p-5 sm:p-6 transition-all duration-200 hover:border-accent/50 hover:bg-surface/80 hover:shadow-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`View full detail for ${activity.title}`}
    >
      {/* Left Column: Thumbnail + Metadata & Title */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
        {/* Optional compact thumbnail */}
        {activity.coverImage && (
          <div className="relative h-16 w-20 sm:h-18 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-surface-secondary border border-border/50">
            <Image
              src={activity.coverImage}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="space-y-1 min-w-0">
          {/* Top metadata tags */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-muted-foreground">
            <span className="text-accent font-semibold uppercase tracking-wider">
              {activity.category}
            </span>
            <span>•</span>
            <span>{year}</span>
            {activity.organization && (
              <>
                <span>•</span>
                <span className="truncate max-w-[200px] text-foreground/70">
                  {activity.organization}
                </span>
              </>
            )}
          </div>

          {/* Strong Title */}
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
            {activity.title}
          </h2>

          {/* Minimal 1-2 line clamped excerpt */}
          {activity.shortSummary && (
            <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-relaxed max-w-2xl">
              {activity.shortSummary}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Arrow Indicator */}
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-accent transition-colors shrink-0 self-end sm:self-center">
        <span className="hidden md:inline text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
          View Detail
        </span>
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default ActivityListItem;
