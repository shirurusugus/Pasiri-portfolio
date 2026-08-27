import React from "react";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { ActivitiesTableClient } from "@/components/admin/ActivitiesTableClient";

export const revalidate = 0;

export default async function AdminActivitiesPage() {
  const activities = await prisma.activity.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { eventDate: "desc" }],
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Activities & Events
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage competitions, hackathons, workshops, and exhibitions. Click 🌟 to select which 3 items show on Home.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 text-xs bg-accent text-accent-foreground font-semibold">
          <Link href="/admin/activities/new">
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Activity</span>
          </Link>
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
          <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-base font-semibold text-foreground">No activities recorded yet</h2>
          <p className="text-xs text-muted-foreground">Add your first hackathon or community event.</p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/admin/activities/new">Add Activity</Link>
          </Button>
        </div>
      ) : (
        <ActivitiesTableClient initialActivities={activities} />
      )}
    </div>
  );
}
