import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminProjectPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!project) notFound();

  return (
    <div className="space-y-6">
      {/* Admin Preview Floating Bar */}
      <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-semibold">Live CMS Preview Mode</span>
          <span>• Current Status: {project.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-7 text-xs bg-surface border-border">
            <Link href={`/admin/projects/${project.id}`}>Exit Preview & Edit</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/30 p-6 sm:p-10 backdrop-blur-sm shadow-xl">
        <header className="space-y-6 border-b border-border/60 pb-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{project.category}</Badge>
            <span className="text-xs font-mono text-muted-foreground">
              {formatDate(project.completedAt || project.updatedAt, { year: "numeric", month: "long" })}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {project.title}
          </h1>

          <p className="text-lg text-foreground/80 leading-relaxed sm:text-xl">
            {project.shortSummary}
          </p>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-surface/40 p-4 text-xs sm:grid-cols-4">
            {project.role && (
              <div>
                <span className="text-muted-foreground uppercase text-[10px]">Role</span>
                <p className="font-medium text-foreground">{project.role}</p>
              </div>
            )}
            {project.organization && (
              <div>
                <span className="text-muted-foreground uppercase text-[10px]">Organization</span>
                <p className="font-medium text-foreground">{project.organization}</p>
              </div>
            )}
            {project.technologies && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground uppercase text-[10px]">Stack</span>
                <p className="font-mono text-muted-foreground">{project.technologies}</p>
              </div>
            )}
          </div>
        </header>

        {project.coverImage && (
          <div className="my-8 overflow-hidden rounded-xl border border-border/80 bg-surface-secondary">
            <div className="relative h-64 w-full sm:h-96">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <article className="py-6">
          <BlockRenderer blocks={project.blocks} rawContent={project.rawContent} />
        </article>
      </div>
    </div>
  );
}
