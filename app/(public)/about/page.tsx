import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, MapPin, Mail, Sparkles, Compass, Lightbulb } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About",
  description: "About pasiri — software architect, design engineer, and digital product designer.",
};

export default async function AboutPage() {
  const profile = await prisma.profile.findFirst({
    include: {
      educations: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Profile information is being updated.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row items-start gap-8 border-b border-border/60 pb-12">
        {profile.avatarUrl && (
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-border/80 bg-surface-secondary shadow-lg sm:h-40 sm:w-40">
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent" />
            <span>{profile.location || "Bangkok, Thailand"}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {profile.fullName}
          </h1>

          <p className="text-lg font-medium text-accent">
            {profile.headline}
          </p>

          <p className="text-sm text-foreground/80 leading-relaxed max-w-xl">
            {profile.bio}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {profile.email && (
              <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5">
                <a href={`mailto:${profile.email}`}>
                  <Mail className="h-3.5 w-3.5" />
                  <span>{profile.email}</span>
                </a>
              </Button>
            )}
            {profile.githubUrl && (
              <Button asChild size="sm" variant="ghost" className="rounded-full gap-1">
                <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                  <span>GitHub</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
            {profile.linkedinUrl && (
              <Button asChild size="sm" variant="ghost" className="rounded-full gap-1">
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                  <span>LinkedIn</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Narrative & Philosophy */}
      <div className="py-12 space-y-12">
        {profile.philosophy && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
              <Compass className="h-4 w-4" />
              <h2>Design & Engineering Philosophy</h2>
            </div>
            <p className="text-base text-foreground/90 leading-relaxed font-normal">
              {profile.philosophy}
            </p>
          </section>
        )}

        {profile.currentFocus && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <h2>Current Focus</h2>
            </div>
            <p className="text-base text-foreground/90 leading-relaxed">
              {profile.currentFocus}
            </p>
          </section>
        )}

        {profile.interests && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
              <Lightbulb className="h-4 w-4" />
              <h2>Interests & Explorations</h2>
            </div>
            <p className="text-base text-foreground/90 leading-relaxed">
              {profile.interests}
            </p>
          </section>
        )}

        {/* Education Section */}
        {profile.educations && profile.educations.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
              <GraduationCap className="h-4 w-4 text-accent" />
              <h2>Education</h2>
            </div>

            <div className="space-y-6">
              {profile.educations.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-xl border border-border/60 bg-surface/30 p-5 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {edu.degree} in {edu.field}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatDate(edu.startDate, { year: "numeric" })} —{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate, { year: "numeric" })}
                    </span>
                  </div>

                  <p className="text-xs text-accent font-medium">
                    {edu.institution} {edu.location && `• ${edu.location}`}
                  </p>

                  {edu.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-border/60 pt-8 flex items-center justify-between">
        <Link href="/experience" className="text-xs font-medium text-accent hover:underline">
          View Experience History →
        </Link>
        <Link href="/projects" className="text-xs font-medium text-accent hover:underline">
          Explore Projects & Case Studies →
        </Link>
      </div>
    </div>
  );
}
