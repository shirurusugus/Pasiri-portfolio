import React from "react";
import Link from "next/link";
import { Plus, FolderGit2, Edit, Trash2, Eye, Star, StarOff, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Projects & Case Studies
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your engineering portfolio, featured highlights, case study blocks, and process milestones.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/admin/projects/new">
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Project</span>
          </Link>
        </Button>
      </div>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
          <FolderGit2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-base font-semibold text-foreground">No projects yet</h2>
          <p className="text-xs text-muted-foreground">Create your first project case study to start building your showcase.</p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/admin/projects/new">Create Project</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-secondary/50 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Title & Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    data-admin-id={project.id}
                    data-admin-title={project.title}
                    data-admin-editable-type="project"
                    data-admin-edit-url={`/admin/projects/${project.id}`}
                    data-admin-preview-url={`/projects/${project.slug}`}
                    data-admin-delete-url={`/api/admin/projects/${project.id}`}
                    data-admin-add-url="/admin/projects/new"
                    className="hover:bg-surface-secondary/30 transition-colors cursor-context-menu"
                  >
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {project.sortOrder}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{project.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {project.category} • /{project.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          project.status === "PUBLISHED"
                            ? "accent"
                            : project.status === "DRAFT"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {project.featured ? (
                        <span className="text-accent font-semibold text-[11px]">★ Featured</span>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <Link href={`/admin/projects/${project.id}/preview`} title="Live Preview">
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <Link href={`/admin/projects/${project.id}`} title="Edit Project">
                            <Edit className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
