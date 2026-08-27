import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Sparkles,
  Trophy,
  Palette,
  BookOpen,
  Award,
  Building2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [
    profile,
    featuredActivities,
    featuredArtworks,
    featuredWriteups,
    totalActivitiesCount,
  ] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.activity.findMany({
      where: { status: "PUBLISHED" },
      take: 3,
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { eventDate: "desc" }],
    }),
    prisma.artwork.findMany({
      where: { status: "PUBLISHED", featured: true },
      take: 3,
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      take: 2,
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    }),
    prisma.activity.count({
      where: { status: "PUBLISHED" },
    }),
  ]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-20 space-y-24">
      {/* 1. HERO SECTION */}
      <section
        data-editable-type="profile"
        data-editable-title="Profile Hero & Bio"
        data-edit-url="/admin/profile"
        className="space-y-8 animate-in fade-in duration-500"
      >
        {profile?.availableFor && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-xs text-muted-foreground backdrop-blur-sm shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{profile.availableFor}</span>
          </div>
        )}

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.08]">
            {profile?.fullName || "PASIRI"}
          </h1>
          <p className="text-xl font-normal text-muted-foreground sm:text-2xl leading-relaxed">
            {profile?.headline || "UX/UI Designer & Design Technologist"}
          </p>
          <p className="text-base text-foreground/80 leading-relaxed max-w-2xl">
            {profile?.bio ||
              "Crafting thoughtful digital interfaces, design systems, and interactive experiences with a deep focus on design thinking, typography, and human cognition."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button asChild size="lg" className="rounded-full px-6 bg-accent text-accent-foreground shadow-md hover:brightness-110">
            <Link href="/activities">
              <span>Explore Activities & Events</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-full px-6 border-border hover:bg-surface-secondary">
            <Link href="/certifications" className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span>Awards & Certificates</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="lg" className="rounded-full px-6 text-muted-foreground hover:text-foreground">
            <Link href="/digital-art" className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span>Digital Art</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* 2. PRIMARY SHOWCASE: ACTIVITIES & EVENTS */}
      {featuredActivities.length > 0 && (
        <section className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Featured Journey & Engagement</span>
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
                Activities & Events
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Hackathons, design competitions, interactive workshops, and leadership milestones.
              </p>
            </div>

            <Link
              href="/activities"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline underline-offset-4 transition-all"
            >
              <span>View All {totalActivitiesCount} Activities</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredActivities.map((act, index) => {
              const tags = act.tags ? act.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
              return (
                <Link
                  key={act.id}
                  href={`/activities/${act.slug}`}
                  data-editable-type="activity"
                  data-editable-id={act.id}
                  data-editable-title={act.title}
                  data-editable-slug={act.slug}
                  data-edit-url={`/admin/activities/${act.id}`}
                  data-add-url="/admin/activities/new"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/40 p-5 transition-all duration-300 hover:border-accent/50 hover:bg-surface/80 backdrop-blur-sm shadow-sm hover:shadow-lg"
                >
                  <div>
                    {/* Cover Image */}
                    {act.coverImage && (
                      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-surface-secondary border border-border/50">
                        <Image
                          src={act.coverImage}
                          alt={act.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {act.featured && (
                          <div className="absolute top-2.5 right-2.5 rounded-full bg-accent/90 px-2.5 py-0.5 text-[9px] font-mono font-bold text-accent-foreground shadow">
                            FEATURED
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <Badge variant="accent" className="text-[10px] font-mono uppercase tracking-wider">
                        {act.category}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                        <Calendar className="h-3 w-3 opacity-60" />
                        <span>{formatDate(act.eventDate, { year: "numeric", month: "short" })}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>

                    {/* Role & Organization if present */}
                    {(act.organization || act.role) && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5 font-medium">
                        {act.organization && (
                          <span className="flex items-center gap-1 truncate">
                            <Building2 className="h-3 w-3 text-accent/70" />
                            <span>{act.organization}</span>
                          </span>
                        )}
                        {act.organization && act.role && <span>•</span>}
                        {act.role && (
                          <span className="truncate text-foreground/80">{act.role}</span>
                        )}
                      </div>
                    )}

                    {/* Summary */}
                    <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {act.shortSummary}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="rounded bg-surface-secondary px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-accent font-semibold">
                    <span className="text-[11px]">View Experience & Timeline</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. SELECTED DIGITAL ART */}
      {featuredArtworks.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-end justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                Visual Art Showcase
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
                Digital Art & Digital Painting
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Digital paintings, character concepts, and atmospheric lighting studies.
              </p>
            </div>

            <Link
              href="/digital-art"
              className="group hidden sm:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {featuredArtworks.map((art) => (
              <Link
                key={art.id}
                href={`/digital-art/${art.slug}`}
                data-editable-type="artwork"
                data-editable-id={art.id}
                data-editable-title={art.title}
                data-editable-slug={art.slug}
                data-edit-url={`/admin/digital-art/${art.id}`}
                data-add-url="/admin/digital-art/new"
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/40 p-4 transition-all duration-300 hover:border-accent/50 hover:bg-surface/80 backdrop-blur-sm shadow-sm"
              >
                <div>
                  <div className="relative mb-3 h-52 w-full overflow-hidden rounded-xl bg-surface-secondary border border-border/50">
                    <Image
                      src={art.thumbnailUrl || art.imageUrl}
                      alt={art.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                    <span>{art.category?.name || "Digital Art"}</span>
                    <span>{art.year}</span>
                  </div>

                  <h3 className="text-sm font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {art.title}
                  </h3>

                  {art.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {art.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-accent font-medium">
                  <span>View artwork</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. SELECTED WRITE-UPS & RESEARCH */}
      {featuredWriteups.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-end justify-between border-b border-border/60 pb-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                Writing & Research
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">
                Write-ups & Insights
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Essays on design systems architecture, HCI, and web performance.
              </p>
            </div>

            <Link
              href="/write-ups"
              className="group hidden sm:inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
            >
              <span>All Write-ups</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {featuredWriteups.map((post) => (
              <Link
                key={post.id}
                href={`/write-ups/${post.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-border/80 bg-surface/40 p-6 transition-all hover:border-accent/40 hover:bg-surface/80 backdrop-blur-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    {post.category && (
                      <span className="text-accent uppercase font-semibold">{post.category.name}</span>
                    )}
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-accent font-medium">
                  <span>Read essay</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. DESIGN PROCESS & PHILOSOPHY */}
      {profile?.philosophy && (
        <section className="rounded-2xl border border-border/80 bg-surface/30 p-8 sm:p-10 backdrop-blur-sm space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
            Design Thinking & Craft
          </span>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            A Structured, Empathetic Approach to Interaction Design
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl">
            {profile.philosophy}
          </p>
          {profile.currentFocus && (
            <p className="text-xs text-muted-foreground pt-1">
              <strong className="text-foreground">Current Focus:</strong> {profile.currentFocus}
            </p>
          )}
        </section>
      )}

      {/* 6. CONTACT CTA */}
      <section className="rounded-2xl border border-border/80 bg-surface/50 p-8 sm:p-12 text-center backdrop-blur-sm space-y-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          Let's build something thoughtful together.
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Feel free to reach out for design collaborations, event participations, or consulting inquiries.
        </p>
        <div className="pt-2">
          <Button asChild size="lg" className="rounded-full px-8 bg-accent text-accent-foreground shadow-md hover:brightness-110">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
