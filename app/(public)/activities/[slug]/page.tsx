import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Building2, UserCheck, Award, ExternalLink, Github, FileText, CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ActivityDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ActivityDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const activity = await prisma.activity.findUnique({
    where: { slug },
  });

  if (!activity) return { title: "Activity Not Found" };

  return {
    title: activity.seoTitle || `${activity.title} — Activities & Events`,
    description: activity.seoDescription || activity.shortSummary,
    openGraph: {
      title: activity.title,
      description: activity.shortSummary,
      images: activity.coverImage ? [activity.coverImage] : undefined,
    },
  };
}

export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const { slug } = await params;

  const activity = await prisma.activity.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!activity || activity.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch related activities (other published activities)
  const relatedActivities = await prisma.activity.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: activity.id },
    },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  const tags = activity.tags
    ? activity.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const skills = activity.skillsGained
    ? activity.skillsGained.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  let gallery: string[] = [];
  if (activity.galleryImages) {
    try {
      gallery = JSON.parse(activity.galleryImages);
    } catch {}
  }

  return (
    <div
      data-editable-type="activity"
      data-editable-id={activity.id}
      data-editable-title={activity.title}
      data-edit-url={`/admin/activities/${activity.id}`}
      data-add-url="/admin/activities/new"
      className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 space-y-12"
    >
      {/* Back to index link */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/activities">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Activities & Events</span>
          </Link>
        </Button>
      </div>

      {/* Hero Header */}
      <header className="space-y-6 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="font-mono text-xs uppercase">
            {activity.category}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(activity.eventDate, { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
          {activity.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-accent" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
          {activity.title}
        </h1>

        <p className="text-lg text-foreground/85 leading-relaxed sm:text-xl max-w-3xl">
          {activity.shortSummary}
        </p>

        {/* Metadata Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/80 bg-surface/50 p-4 text-xs sm:grid-cols-4">
          {activity.role && (
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Role</span>
              <p className="font-medium text-foreground mt-0.5">{activity.role}</p>
            </div>
          )}
          {activity.organization && (
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Organization</span>
              <p className="font-medium text-foreground mt-0.5">{activity.organization}</p>
            </div>
          )}
          {activity.startDate && (
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Duration</span>
              <p className="font-medium text-foreground mt-0.5">
                {formatDate(activity.startDate, { month: "short", day: "numeric" })} —{" "}
                {activity.endDate ? formatDate(activity.endDate, { month: "short", day: "numeric", year: "numeric" }) : "Present"}
              </p>
            </div>
          )}
          {tags.length > 0 && (
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Domain</span>
              <p className="font-medium text-accent truncate mt-0.5">{tags.slice(0, 2).join(", ")}</p>
            </div>
          )}
        </div>
      </header>

      {/* Cover Image */}
      {activity.coverImage && (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface-secondary shadow-lg">
          <div className="relative h-72 w-full sm:h-96 md:h-[450px]">
            <Image
              src={activity.coverImage}
              alt={activity.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Objectives & Responsibilities Grid if present */}
      {(activity.objectives || activity.responsibilities) && (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activity.objectives && (
            <div className="rounded-xl border border-border/80 bg-surface/40 p-6 space-y-2.5">
              <div className="flex items-center gap-2 text-accent">
                <Lightbulb className="h-4 w-4" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Objectives & Challenge
                </h2>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {activity.objectives}
              </p>
            </div>
          )}

          {activity.responsibilities && (
            <div className="rounded-xl border border-border/80 bg-surface/40 p-6 space-y-2.5">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="h-4 w-4" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Key Responsibilities
                </h2>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {activity.responsibilities}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Main Narrative & Process Timeline Blocks */}
      <article className="w-full py-2">
        <BlockRenderer
          blocks={activity.blocks}
          rawContent={activity.rawContent}
        />
      </article>

      {/* Gallery Section if present */}
      {gallery.length > 0 && (
        <section className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-base font-bold text-foreground">
            Visual Artifacts & Gallery
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {gallery.map((imgUrl, i) => (
              <div key={i} className="relative h-48 overflow-hidden rounded-xl border border-border bg-surface-secondary">
                <Image src={imgUrl} alt={`Gallery artifact ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outcomes & Reflection */}
      {(activity.outcomes || activity.reflection) && (
        <section className="space-y-6 border-t border-border/60 pt-8">
          <h2 className="text-lg font-bold text-foreground">
            Outcomes & Critical Reflection
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activity.outcomes && (
              <div className="rounded-xl border border-border/80 bg-surface/40 p-6 space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Award className="h-4 w-4" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Results & Impact
                  </h3>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed">
                  {activity.outcomes}
                </p>
              </div>
            )}

            {activity.reflection && (
              <div className="rounded-xl border border-border/80 bg-surface/40 p-6 space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Designer's Reflection
                  </h3>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed italic">
                  "{activity.reflection}"
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Skills & Tools Gained */}
      {skills.length > 0 && (
        <section className="space-y-3 border-t border-border/60 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Skills, Methodologies & Tooling Applied
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="rounded-lg border border-border bg-surface px-3 py-1 text-xs text-foreground font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* External Links & Certificate */}
      {(activity.externalUrl || activity.githubUrl || activity.certificateUrl) && (
        <section className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
          {activity.externalUrl && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
              <a href={activity.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Live Project / Case Link</span>
              </a>
            </Button>
          )}
          {activity.githubUrl && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
              <a href={activity.githubUrl} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </a>
            </Button>
          )}
          {activity.certificateUrl && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
              <a href={activity.certificateUrl} target="_blank" rel="noreferrer">
                <Award className="h-3.5 w-3.5" />
                <span>View Certificate</span>
              </a>
            </Button>
          )}
        </section>
      )}

      {/* Related Activities Carousel / List */}
      {relatedActivities.length > 0 && (
        <section className="space-y-6 border-t border-border/60 pt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              More Activities & Events
            </h3>
            <Link
              href="/activities"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedActivities.map((rel) => (
              <Link
                key={rel.id}
                href={`/activities/${rel.slug}`}
                className="group rounded-xl border border-border bg-surface/40 p-4 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <span className="text-[10px] font-mono uppercase text-accent">
                  {rel.category}
                </span>
                <h4 className="font-semibold text-xs text-foreground uppercase mt-1 group-hover:text-accent transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5">
                  {rel.shortSummary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
