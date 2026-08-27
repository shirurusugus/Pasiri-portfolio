import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Eye, Edit2, Palette, Sparkles, FolderPlus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminDigitalArtPage() {
  const [artworks, categories] = await Promise.all([
    prisma.artwork.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.artworkCategory.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { artworks: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Digital Art & Digital Painting
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your digital paintings, character designs, concept art, and visual studies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-border">
            <Link href="/admin/digital-art/categories">
              <FolderPlus className="h-3.5 w-3.5" />
              <span>Categories ({categories.length})</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-8 gap-1.5 text-xs bg-accent text-accent-foreground">
            <Link href="/admin/digital-art/new">
              <Plus className="h-3.5 w-3.5" />
              <span>New Artwork</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Artworks Table / Grid */}
      {artworks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <Palette className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <p className="text-sm font-medium text-foreground">No artworks published yet</p>
          <p className="text-xs text-muted-foreground">Get started by uploading your first digital painting or study.</p>
          <Button asChild size="sm" className="mt-2 text-xs bg-accent text-accent-foreground">
            <Link href="/admin/digital-art/new">Create Artwork</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-secondary/50 text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Artwork</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Medium / Tool</th>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {artworks.map((art) => (
                  <tr
                    key={art.id}
                    data-admin-id={art.id}
                    data-admin-title={art.title}
                    data-admin-editable-type="artwork"
                    data-admin-edit-url={`/admin/digital-art/${art.id}`}
                    data-admin-preview-url={`/digital-art/${art.slug}`}
                    data-admin-delete-url={`/api/admin/artworks/${art.id}`}
                    data-admin-add-url="/admin/digital-art/new"
                    className="hover:bg-surface-secondary/40 transition-colors cursor-context-menu"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-surface-secondary">
                          <Image
                            src={art.thumbnailUrl || art.imageUrl}
                            alt={art.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/admin/digital-art/${art.id}`}
                            className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                          >
                            {art.title}
                          </Link>
                          <span className="font-mono text-[10px] text-muted-foreground block">
                            /{art.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      {art.category?.name || "—"}
                    </td>

                    <td className="py-3 px-4 text-muted-foreground">
                      <span className="font-medium text-foreground block">{art.medium || "Digital"}</span>
                      <span className="text-[10px] text-muted-foreground">{art.software || "—"}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {art.year}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            art.status === "PUBLISHED"
                              ? "accent"
                              : art.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[10px] font-mono"
                        >
                          {art.status}
                        </Badge>
                        {art.featured && (
                          <Badge variant="outline" className="text-[9px] border-accent/40 text-accent">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {art.sortOrder}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <Link href={`/digital-art/${art.slug}`} target="_blank" title="View Public Page">
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-accent">
                          <Link href={`/admin/digital-art/${art.id}`} title="Edit Artwork">
                            <Edit2 className="h-3.5 w-3.5" />
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
