import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, MapPin, Calendar } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminActivityPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!activity) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-semibold">Live Activity Preview</span>
          <span>• Current Status: {activity.status}</span>
        </div>
        <Button asChild size="sm" variant="outline" className="h-7 text-xs bg-surface border-border">
          <Link href={`/admin/activities/${activity.id}`}>Exit Preview & Edit</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/30 p-6 sm:p-10 backdrop-blur-sm shadow-xl space-y-6">
        <div className="space-y-3 border-b border-border/60 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{activity.category}</Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(activity.eventDate)}</span>
            </div>
            {activity.location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {activity.title}
          </h1>

          <p className="text-base text-foreground/80 leading-relaxed">
            {activity.shortSummary}
          </p>
        </div>

        {activity.coverImage && (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-secondary">
            <div className="relative h-64 w-full sm:h-80">
              <Image
                src={activity.coverImage}
                alt={activity.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <article className="py-4">
          <BlockRenderer blocks={activity.blocks} rawContent={activity.rawContent} />
        </article>
      </div>
    </div>
  );
}
