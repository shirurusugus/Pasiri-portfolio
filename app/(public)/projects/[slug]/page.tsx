import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Github,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Award,
  Users,
  Building2,
  Layers,
  Wrench,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
  });

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.seoTitle || `${project.title} — Case Study`,
    description: project.seoDescription || project.shortSummary,
    openGraph: {
      title: project.title,
      description: project.shortSummary,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!project || project.status !== "PUBLISHED") {
    notFound();
  }

  // Fetch 3 related projects
  const relatedProjects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: project.id },
    },
    take: 3,
    orderBy: { sortOrder: "asc" },
  });

  // Fetch related activity if specified
  let relatedActivity = null;
  if (project.relatedActivitySlug) {
    relatedActivity = await prisma.activity.findUnique({
      where: { slug: project.relatedActivitySlug },
      select: { id: true, title: true, slug: true, category: true },
    });
  }

  const tags = project.tags
    ? project.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const technologies = project.technologies
    ? project.technologies.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  let gallery: string[] = [];
  if (project.galleryImages) {
    try {
      gallery = JSON.parse(project.galleryImages);
    } catch {}
  }

  return (
    <div
      data-editable-type="project"
      data-editable-id={project.id}
      data-editable-title={project.title}
      data-edit-url={`/admin/projects/${project.id}`}
      data-add-url="/admin/projects/new"
      className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 space-y-12"
    >
      {/* Back to index */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/projects">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects</span>
          </Link>
        </Button>
      </div>

      {/* Header & Hero Title */}
      <header className="space-y-6 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent" className="font-mono text-xs uppercase">
            {project.category}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {project.year}
          </span>
          {project.organization && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground">{project.organization}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
          {project.title}
        </h1>

        <p className="text-lg text-foreground/85 leading-relaxed sm:text-xl max-w-3xl">
          {project.shortSummary}
        </p>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/80 bg-surface/50 p-4 text-xs sm:grid-cols-4">
          {project.role && (
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Role</span>
              <p className="font-medium text-foreground mt-0.5">{project.role}</p>
            </div>
          )}
          {project.team && (
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Team</span>
              <p className="font-medium text-foreground mt-0.5">{project.team}</p>
            </div>
          )}
          {project.tools && (
            <div>
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Tools</span>
              <p className="font-medium text-foreground mt-0.5">{project.tools}</p>
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

      {/* Hero Image */}
      {project.coverImage && (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface-secondary shadow-lg">
          <div className="relative h-72 w-full sm:h-96 md:h-[450px]">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Problem & Challenge if present */}
      {project.problem && (
        <section className="rounded-xl border border-border/80 bg-surface/40 p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Lightbulb className="h-4 w-4" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              The Challenge & Problem Statement
            </h2>
          </div>
          <p className="text-sm sm:text-base text-foreground/85 leading-relaxed">
            {project.problem}
          </p>
        </section>
      )}

      {/* Main Narrative & Process Timeline Blocks */}
      <article className="w-full py-2">
        <BlockRenderer
          blocks={project.blocks}
          rawContent={project.rawContent}
        />
      </article>

      {/* Gallery Artifacts */}
      {gallery.length > 0 && (
        <section className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-base font-bold text-foreground">
            Design Artifacts & Screen Gallery
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {gallery.map((imgUrl, i) => (
              <div key={i} className="relative h-52 overflow-hidden rounded-xl border border-border bg-surface-secondary">
                <Image src={imgUrl} alt={`Design artifact ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outcomes & Reflection */}
      {(project.outcomes || project.reflection) && (
        <section className="space-y-6 border-t border-border/60 pt-8">
          <h2 className="text-lg font-bold text-foreground">
            Impact, Outcomes & Critical Reflection
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {project.outcomes && (
              <div className="rounded-xl border border-border/80 bg-surface/40 p-6 space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Award className="h-4 w-4" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Outcomes & Impact
                  </h3>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed">
                  {project.outcomes}
                </p>
              </div>
            )}

            {project.reflection && (
              <div className="rounded-xl border border-border/80 bg-surface/40 p-6 space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Designer's Reflection
                  </h3>
                </div>
                <p className="text-xs text-foreground/85 leading-relaxed italic">
                  "{project.reflection}"
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Technologies & Tools */}
      {technologies.length > 0 && (
        <section className="space-y-3 border-t border-border/60 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Technology Stack & Methodologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, i) => (
              <span
                key={i}
                className="rounded-lg border border-border bg-surface px-3 py-1 text-xs text-foreground font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* External Links & Related Activity */}
      {(project.externalUrl || project.githubUrl || relatedActivity) && (
        <section className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
          {project.externalUrl && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
              <a href={project.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Live Project Demo</span>
              </a>
            </Button>
          )}
          {project.githubUrl && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
              <a href={project.githubUrl} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Repository</span>
              </a>
            </Button>
          )}
          {relatedActivity && (
            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs border-accent/40 text-accent">
              <Link href={`/activities/${relatedActivity.slug}`}>
                <span>Related Activity: {relatedActivity.title}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </section>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="space-y-6 border-t border-border/60 pt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              More Case Studies & Projects
            </h3>
            <Link
              href="/projects"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedProjects.map((rel) => (
              <Link
                key={rel.id}
                href={`/projects/${rel.slug}`}
                className="group rounded-xl border border-border bg-surface/40 p-4 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <span className="text-[10px] font-mono uppercase text-accent">
                  {rel.category} • {rel.year}
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
