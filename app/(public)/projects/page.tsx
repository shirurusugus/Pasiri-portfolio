import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { ProjectsExplorer } from "@/components/public/ProjectsExplorer";
import { FolderGit2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects & Case Studies — Pasiri Portfolio",
  description:
    "A showcase of UX/UI architecture, product design, design systems, and digital interactive engineering projects by Pasiri.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { year: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      shortSummary: true,
      category: true,
      year: true,
      role: true,
      organization: true,
      coverImage: true,
      tags: true,
      featured: true,
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 space-y-12">
      {/* Header */}
      <header className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          <FolderGit2 className="h-3.5 w-3.5 text-accent" />
          <span>Product Design & Case Studies</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
          Projects & Case Studies
        </h1>

        <p className="text-base text-foreground/80 leading-relaxed sm:text-lg">
          Substantial product design systems, user research investigations, accessibility frameworks, and interactive web applications.
        </p>
      </header>

      {/* Projects Grid Explorer */}
      <ProjectsExplorer projects={projects} />
    </div>
  );
}
