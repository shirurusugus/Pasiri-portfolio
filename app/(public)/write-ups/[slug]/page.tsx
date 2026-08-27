import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Share2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface WriteUpDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: WriteUpDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return { title: "Write-up Not Found" };

  return {
    title: post.seoTitle || `${post.title} — Write-up`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function WriteUpDetailPage({
  params,
}: WriteUpDetailPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      blocks: { orderBy: { order: "asc" } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // Related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      NOT: { id: post.id },
      ...(post.categoryId ? { categoryId: post.categoryId } : {}),
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return (
    <div
      data-editable-type="blog"
      data-editable-id={post.id}
      data-editable-title={post.title}
      data-edit-url={`/admin/blog/${post.id}`}
      data-add-url="/admin/blog/new"
      className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 space-y-10 animate-in fade-in duration-300"
    >
      {/* Back button */}
      <div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Link href="/write-ups">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Write-ups</span>
          </Link>
        </Button>
      </div>

      {/* Header */}
      <header className="space-y-4 border-b border-border/60 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {post.category && (
            <Badge variant="accent" className="font-mono text-[10px] uppercase">
              {post.category.name}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-mono">
            {formatDate(post.publishedAt)}
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs text-muted-foreground font-mono">
            {post.readingTimeMin || 5} min read
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl leading-[1.15]">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-foreground/80 leading-relaxed sm:text-xl font-normal">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Hero Cover Image */}
      {post.coverImage && (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface-secondary shadow-lg">
          <div className="relative h-64 w-full sm:h-96">
            <Image
              src={post.coverImage}
              alt=""
              aria-hidden="true"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Long-form Editorial Article */}
      <article className="prose-editorial py-4 leading-relaxed text-foreground/90">
        <BlockRenderer
          blocks={post.blocks}
          rawContent={post.rawContent}
        />
      </article>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-6">
          <span className="text-xs text-muted-foreground font-mono">Tags:</span>
          {post.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Related Write-ups */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 border-t border-border/60 pt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              More Write-ups & Research
            </h3>
            <Link
              href="/write-ups"
              className="text-xs text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/write-ups/${rel.slug}`}
                className="group rounded-xl border border-border bg-surface/40 p-4 transition-all hover:border-accent/40 hover:bg-surface"
              >
                <span className="text-[10px] font-mono uppercase text-accent">
                  {rel.category?.name || "Essay"}
                </span>
                <h4 className="font-semibold text-xs text-foreground mt-1 group-hover:text-accent transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                  {rel.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
