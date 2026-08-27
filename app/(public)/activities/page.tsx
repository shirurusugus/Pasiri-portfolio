import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { ActivityList } from "@/components/public/ActivityList";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Activities & Events — Pasiri Portfolio",
  description:
    "An editorial directory of hackathons, intensive bootcamps, academic exhibitions, and community workshops by Pasiri.",
};

export const revalidate = 60;

export default async function ActivitiesPage() {
  const activities = await prisma.activity.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { eventDate: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      shortSummary: true,
      category: true,
      organization: true,
      role: true,
      location: true,
      eventDate: true,
      coverImage: true,
      tags: true,
    },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 space-y-10">
      {/* Header */}
      <header className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          <Calendar className="h-3.5 w-3.5 text-accent" />
          <span>Content Index & Directory</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
          Activities & Events
        </h1>

        <p className="text-base text-foreground/80 leading-relaxed sm:text-lg">
          An itemized directory of hackathons, service design bootcamps, research labs, exhibitions, and teaching experiences.
        </p>
      </header>

      {/* Directory Index List */}
      <ActivityList activities={activities} />
    </div>
  );
}
