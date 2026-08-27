"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowRight, MapPin, Calendar, Building2, UserCheck, Sparkles, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  coverImage?: string | null;
  galleryImages?: string | null;
  objectives?: string | null;
  responsibilities?: string | null;
  outcomes?: string | null;
  reflection?: string | null;
  skillsGained?: string | null;
  tags?: string | null;
  externalUrl?: string | null;
  githubUrl?: string | null;
  blocks?: any[];
  rawContent?: string | null;
}

interface ActivitiesExplorerProps {
  activities: ActivityItem[];
  initialSlug?: string;
}

export function ActivitiesExplorer({
  activities = [],
  initialSlug,
}: ActivitiesExplorerProps) {
  const router = useRouter();

  // Selected item state
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    if (initialSlug && activities.some((a) => a.slug === initialSlug)) {
      return initialSlug;
    }
    return activities[0]?.slug || "";
  });

  const [mobileSelectOpen, setMobileSelectOpen] = useState(false);

  useEffect(() => {
    if (initialSlug && activities.some((a) => a.slug === initialSlug)) {
      setSelectedSlug(initialSlug);
    }
  }, [initialSlug, activities]);

  const selectedActivity =
    activities.find((a) => a.slug === selectedSlug) || activities[0];

  const handleSelect = (slug: string) => {
    setSelectedSlug(slug);
    setMobileSelectOpen(false);
    window.history.pushState(null, "", `/activities/${slug}`);
  };

  if (!selectedActivity) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        No activities published yet.
      </div>
    );
  }

  const tags = selectedActivity.tags
    ? selectedActivity.tags.split(",").map((t) => t.trim())
    : [];

  const skills = selectedActivity.skillsGained
    ? selectedActivity.skillsGained.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-start">
      {/* ---------------------------------------------------- */}
      {/* MOBILE COLLAPSIBLE SELECTOR (< 1024px) */}
      {/* ---------------------------------------------------- */}
      <div className="lg:hidden">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Select Activity / Event
        </label>
        <button
          onClick={() => setMobileSelectOpen(!mobileSelectOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:border-accent"
        >
          <div className="pr-2">
            <span className="text-[10px] font-mono font-semibold uppercase text-accent">
              {selectedActivity.category}
            </span>
            <p className="text-sm font-semibold text-foreground line-clamp-1">
              {selectedActivity.title}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
              mobileSelectOpen && "rotate-180"
            )}
          />
        </button>

        {mobileSelectOpen && (
          <div className="mt-2 divide-y divide-border/60 rounded-xl border border-border bg-surface shadow-xl animate-in fade-in duration-150">
            {activities.map((act) => {
              const active = act.slug === selectedSlug;
              return (
                <button
                  key={act.id}
                  onClick={() => handleSelect(act.slug)}
                  className={cn(
                    "flex w-full items-center justify-between p-3.5 text-left text-xs transition-colors",
                    active
                      ? "bg-surface-secondary text-accent font-semibold"
                      : "text-foreground hover:bg-surface-secondary/60"
                  )}
                >
                  <div className="pr-2">
                    <span className="block text-[10px] text-muted-foreground uppercase font-mono">
                      {act.category} • {formatDate(act.eventDate)}
                    </span>
                    <span className="font-medium line-clamp-1">{act.title}</span>
                  </div>
                  <span className="text-muted-foreground text-sm font-mono">&gt;</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* DESKTOP EDITORIAL LEFT INDEX (lg:col-span-5) */}
      {/* ---------------------------------------------------- */}
      <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-3">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Activities & Events ({activities.length})
        </div>

        <nav className="space-y-2" aria-label="Activities Index">
          {activities.map((act) => {
            const isSelected = act.slug === selectedSlug;
            return (
              <div
                key={act.id}
                className={cn(
                  "rounded-xl border transition-all duration-200 overflow-hidden",
                  isSelected
                    ? "border-accent/50 bg-surface/90 shadow-md ring-1 ring-accent/30"
                    : "border-border/60 bg-surface/30 hover:border-border hover:bg-surface/60"
                )}
              >
                {/* Header row */}
                <button
                  onClick={() => handleSelect(act.slug)}
                  className="flex w-full items-center justify-between p-3.5 text-left group"
                >
                  <div className="pr-2">
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase tracking-wider block mb-0.5",
                        isSelected ? "text-accent font-semibold" : "text-muted-foreground/70"
                      )}
                    >
                      {act.category}
                    </span>
                    <h3
                      className={cn(
                        "text-xs font-semibold tracking-tight uppercase",
                        isSelected ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                      )}
                    >
                      {act.title}
                    </h3>
                  </div>

                  <span
                    className={cn(
                      "font-mono text-xs shrink-0 transition-transform duration-200",
                      isSelected
                        ? "text-accent font-bold"
                        : "text-muted-foreground/50 group-hover:text-foreground"
                    )}
                  >
                    {isSelected ? "▼" : ">"}
                  </span>
                </button>

                {/* Expanded summary snippet when selected */}
                {isSelected && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs border-t border-border/40 text-muted-foreground/90 space-y-2 animate-in fade-in duration-200">
                    <p className="line-clamp-2 leading-relaxed">
                      {act.shortSummary}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {formatDate(act.eventDate, { month: "short", year: "numeric" })}
                      </span>
                      <Link
                        href={`/activities/${act.slug}`}
                        className="text-[11px] font-medium text-accent hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Page</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* RIGHT SELECTED ACTIVITY DETAIL (lg:col-span-7) */}
      {/* ---------------------------------------------------- */}
      <article className="lg:col-span-7 space-y-8 rounded-2xl border border-border/80 bg-surface/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm animate-in fade-in duration-300">
        {/* Header Metadata */}
        <div className="space-y-4 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" className="font-mono text-xs uppercase">
                {selectedActivity.category}
              </Badge>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(selectedActivity.eventDate, { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>

              {selectedActivity.location && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  <span>{selectedActivity.location}</span>
                </div>
              )}
            </div>

            <Button asChild size="sm" className="gap-1.5 text-xs bg-accent text-accent-foreground">
              <Link href={`/activities/${selectedActivity.slug}`}>
                <span>Read Full Detail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {selectedActivity.title}
          </h2>

          <p className="text-base text-foreground/90 leading-relaxed sm:text-lg">
            {selectedActivity.shortSummary}
          </p>

          {/* Quick Context Bar */}
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-surface/60 p-3.5 text-xs sm:grid-cols-3">
            {selectedActivity.role && (
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Role</span>
                <p className="font-medium text-foreground">{selectedActivity.role}</p>
              </div>
            )}
            {selectedActivity.organization && (
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Organization</span>
                <p className="font-medium text-foreground">{selectedActivity.organization}</p>
              </div>
            )}
            {skills.length > 0 && (
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Key Skills</span>
                <p className="font-medium text-accent truncate">{skills.slice(0, 3).join(", ")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cover Image */}
        {selectedActivity.coverImage && (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-secondary">
            <div className="relative h-60 w-full sm:h-80">
              <Image
                src={selectedActivity.coverImage}
                alt={selectedActivity.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Detailed Blocks (Process Timeline, narrative) */}
        <div className="space-y-6 pt-2">
          <BlockRenderer
            blocks={selectedActivity.blocks}
            rawContent={selectedActivity.rawContent}
          />
        </div>

        {/* Bottom CTA to full dedicated page */}
        <div className="border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            Want to see full objectives, gallery, and reflection?
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs border-border">
            <Link href={`/activities/${selectedActivity.slug}`}>
              <span>Open Dedicated Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

export default ActivitiesExplorer;
