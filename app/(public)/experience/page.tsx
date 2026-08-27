import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Experience",
  description: "Work experience, engineering roles, and technical leadership history of pasiri.",
};

export const revalidate = 60;

export default async function ExperiencePage() {
  const experiences = await prisma.experience.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-12 border-b border-border/60 pb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Experience
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          Career history, engineering leadership, and human-computer interaction research roles.
        </p>
      </div>

      {/* Itemized Vertical Experience List */}
      <div className="relative space-y-12">
        {/* Subtle continuous vertical guide line */}
        <div
          className="absolute left-0 top-3 bottom-3 w-[1px] bg-border/80 hidden sm:block"
          aria-hidden="true"
        />

        {experiences.map((exp) => {
          const startFormatted = formatDate(exp.startDate, { month: "short", year: "numeric" });
          const endFormatted = exp.present
            ? "Present"
            : formatDate(exp.endDate, { month: "short", year: "numeric" });

          const tags = exp.tags ? exp.tags.split(",").map((t) => t.trim()) : [];

          return (
            <article
              key={exp.id}
              className="relative sm:pl-8 group"
            >
              {/* Subtle small dot on line */}
              <div
                className="absolute -left-[3px] top-2 h-1.5 w-1.5 rounded-full bg-accent/60 hidden sm:block group-hover:bg-accent transition-colors"
                aria-hidden="true"
              />

              <div className="rounded-xl border border-border/60 bg-surface/30 p-6 sm:p-7 backdrop-blur-sm space-y-3 transition-all hover:border-accent/40 hover:bg-surface/60">
                {/* Date & Organization Header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {exp.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs font-medium text-accent">
                      <span>{exp.organization}</span>
                      {exp.location && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="text-muted-foreground">{exp.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-mono text-muted-foreground shrink-0 mt-1 sm:mt-0">
                    {startFormatted} — {endFormatted}
                  </span>
                </div>

                {/* Narrative Description */}
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed pt-1">
                  {exp.description}
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[11px] font-normal px-2 py-0.5 border border-border/60 bg-surface-secondary/60 text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* External Link */}
                {exp.linkUrl && (
                  <div className="pt-2">
                    <a
                      href={exp.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                    >
                      <span>Organization website</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-16 border-t border-border/60 pt-8 flex items-center justify-between">
        <Link href="/resume" className="text-xs font-medium text-accent hover:underline">
          View Structured Resume & PDF →
        </Link>
        <Link href="/projects" className="text-xs font-medium text-accent hover:underline">
          Explore Case Studies →
        </Link>
      </div>
    </div>
  );
}
