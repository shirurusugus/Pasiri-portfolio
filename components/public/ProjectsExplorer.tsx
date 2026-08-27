"use client";

import React, { useState } from "react";
import { ProjectCard } from "@/components/public/ProjectCard";
import { cn } from "@/lib/utils";

interface ProjectItem {
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
}

interface ProjectsExplorerProps {
  projects: ProjectItem[];
}

export function ProjectsExplorer({ projects = [] }: ProjectsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = Array.from(
    new Set(projects.map((p) => p.category).filter(Boolean))
  );

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-10">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
            selectedCategory === "all"
              ? "bg-accent text-accent-foreground font-semibold shadow-sm"
              : "bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
          )}
        >
          All Projects ({projects.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              selectedCategory === cat
                ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                : "bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center text-xs text-muted-foreground">
          No projects found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsExplorer;
