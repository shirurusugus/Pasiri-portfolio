import React from "react";
import Link from "next/link";
import { Plus, FileText, Edit, Eye } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const revalidate = 0;

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blog Posts & Essays
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Write, manage, and publish technical articles, reflections, and process case studies.
          </p>
        </div>

        <Button asChild size="sm" className="gap-1.5 text-xs">
          <Link href="/admin/blog/new">
            <Plus className="h-3.5 w-3.5" />
            <span>Write New Article</span>
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center space-y-3">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h2 className="text-base font-semibold text-foreground">No articles published yet</h2>
          <p className="text-xs text-muted-foreground">Start drafting your first essay or technical reflection.</p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/admin/blog/new">Write Article</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-secondary/50 font-medium text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Read Time</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    data-admin-id={post.id}
                    data-admin-title={post.title}
                    data-admin-editable-type="blog"
                    data-admin-edit-url={`/admin/blog/${post.id}`}
                    data-admin-preview-url={`/write-ups/${post.slug}`}
                    data-admin-delete-url={`/api/admin/blog/${post.id}`}
                    data-admin-add-url="/admin/blog/new"
                    className="hover:bg-surface-secondary/30 transition-colors cursor-context-menu"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      <div className="font-semibold">{post.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        /{post.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {post.category ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {post.category.name}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={post.status === "PUBLISHED" ? "accent" : "secondary"}
                        className="text-[10px]"
                      >
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {post.readingTimeMin} min
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <Link href={`/admin/blog/${post.id}/preview`} title="Live Preview">
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <Link href={`/admin/blog/${post.id}`} title="Edit Article">
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
