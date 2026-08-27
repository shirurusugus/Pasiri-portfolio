import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    slug: string;
    shortSummary: string;
    category: string;
    year: number;
    role?: string | null;
    organization?: string | null;
    coverImage?: string | null;
    tags?: string | null;
    featured?: boolean;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      data-editable-type="project"
      data-editable-id={project.id}
      data-editable-title={project.title}
      data-editable-slug={project.slug}
      data-edit-url={`/admin/projects/${project.id}`}
      data-add-url="/admin/projects/new"
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/40 p-5 sm:p-6 transition-all duration-300 hover:border-accent/50 hover:bg-surface/80 hover:shadow-md backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`View case study: ${project.title}`}
    >
      <div>
        {/* Cover Image */}
        {project.coverImage ? (
          <div className="relative mb-5 h-48 sm:h-52 w-full overflow-hidden rounded-xl bg-surface-secondary border border-border/50">
            <Image
              src={project.coverImage}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="relative mb-5 h-48 w-full rounded-xl bg-surface-secondary border border-border/50 flex items-center justify-center text-xs text-muted-foreground">
            No cover preview
          </div>
        )}

        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge variant="accent" className="font-mono text-[10px] uppercase">
            {project.category}
          </Badge>
          <span className="font-mono text-[11px] text-muted-foreground">
            {project.year}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
          {project.title}
        </h2>

        {/* Short Excerpt */}
        {project.shortSummary && (
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {project.shortSummary}
          </p>
        )}
      </div>

      {/* Footer View Action */}
      <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center justify-between text-xs text-accent font-medium">
        <span className="text-[11px]">View Case Study</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default ProjectCard;
