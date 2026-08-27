import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminBlogPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      category: true,
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-semibold">Live Article Preview</span>
          <span>• Status: {post.status}</span>
        </div>
        <Button asChild size="sm" variant="outline" className="h-7 text-xs bg-surface border-border">
          <Link href={`/admin/blog/${post.id}`}>Exit Preview & Edit</Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border/80 bg-surface/30 p-6 sm:p-10 backdrop-blur-sm shadow-xl space-y-6 max-w-4xl mx-auto">
        <header className="space-y-4 border-b border-border/60 pb-6 max-w-3xl">
          <div className="flex items-center gap-2 text-xs">
            {post.category && <Badge variant="accent">{post.category.name}</Badge>}
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{post.readingTimeMin} min read</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>

          <p className="text-base text-foreground/80 leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {post.coverImage && (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-secondary">
            <div className="relative h-64 w-full sm:h-96">
              <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
            </div>
          </div>
        )}

        <article className="py-4 prose-editorial">
          <BlockRenderer blocks={post.blocks} rawContent={post.rawContent} />
        </article>
      </div>
    </div>
  );
}
