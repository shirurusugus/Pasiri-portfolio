import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Clock, Calendar } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Write-ups & Research Essays — Pasiri Portfolio",
  description: "Long-form writing, design thinking investigations, software architecture essays, and technical write-ups by Pasiri.",
};

export const revalidate = 60;

export default async function WriteUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}) {
  const { category, tag, q } = await searchParams;

  const whereClause: any = { status: "PUBLISHED" };
  if (category) {
    whereClause.category = { slug: category };
  }
  if (tag) {
    whereClause.tags = { some: { tag: { slug: tag } } };
  }
  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
    ];
  }

  const [posts, categories, featuredPost] = await Promise.all([
    prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.blogCategory.findMany({
      include: { _count: { select: { posts: true } } },
    }),
    !category && !tag && !q
      ? prisma.blogPost.findFirst({
          where: { status: "PUBLISHED", featured: true },
          orderBy: { publishedAt: "desc" },
          include: { category: true },
        })
      : null,
  ]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16 space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <header className="space-y-4 max-w-3xl border-b border-border/60 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
          <BookOpen className="h-3.5 w-3.5 text-accent" />
          <span>Long-form Essays & Technical Writing</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
          Write-ups & Research
        </h1>

        <p className="text-base text-foreground/80 leading-relaxed sm:text-lg">
          In-depth investigations on human-computer interaction, design systems architecture, typography nuances, and engineering craft.
        </p>
      </header>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2" role="navigation" aria-label="Topic filters">
        <Link
          href="/write-ups"
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            !category
              ? "bg-accent text-accent-foreground font-semibold shadow-sm"
              : "border border-border/80 bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground"
          }`}
        >
          All Topics ({posts.length})
        </Link>
        {categories.map((cat) => {
          const isSelected = category === cat.slug;
          return (
            <Link
              key={cat.id}
              href={`/write-ups?category=${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                  : "border border-border/80 bg-surface/60 text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              {cat.name} ({cat._count.posts})
            </Link>
          );
        })}
      </div>

      {/* Featured Write-up */}
      {featuredPost && (
        <section aria-label="Featured Write-up">
          <Link
            href={`/write-ups/${featuredPost.slug}`}
            data-editable-type="blog"
            data-editable-id={featuredPost.id}
            data-editable-title={featuredPost.title}
            data-editable-slug={featuredPost.slug}
            data-edit-url={`/admin/blog/${featuredPost.id}`}
            data-add-url="/admin/blog/new"
            className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-border/80 bg-surface/40 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-surface/80 shadow-sm"
          >
            {featuredPost.coverImage && (
              <div className="relative h-60 w-full md:h-auto md:w-1/2 overflow-hidden bg-surface-secondary">
                <Image
                  src={featuredPost.coverImage}
                  alt=""
                  aria-hidden="true"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            )}

            <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" className="font-mono text-[10px] uppercase">
                    Featured Essay
                  </Badge>
                  {featuredPost.category && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {featuredPost.category.name}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors sm:text-3xl">
                  {featuredPost.title}
                </h2>

                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>{formatDate(featuredPost.publishedAt)}</span>
                  <span>•</span>
                  <span>{featuredPost.readingTimeMin || 5} min read</span>
                </div>
                <span className="text-accent font-medium inline-flex items-center gap-1">
                  <span>Read essay</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Article List / Index */}
      <div className="space-y-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {category ? `Write-ups in "${categories.find((c) => c.slug === category)?.name}"` : "All Write-ups"}
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-surface/30 p-12 text-center text-xs text-muted-foreground">
            No write-ups found in this category.
          </div>
        ) : (
          <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-surface/30 backdrop-blur-sm overflow-hidden">
            {posts.map((post) => (
              <article
                key={post.id}
                data-editable-type="blog"
                data-editable-id={post.id}
                data-editable-title={post.title}
                data-editable-slug={post.slug}
                data-edit-url={`/admin/blog/${post.id}`}
                data-add-url="/admin/blog/new"
                className="group p-6 transition-colors hover:bg-surface/60"
              >
                <Link href={`/write-ups/${post.slug}`} className="block space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {post.category && (
                      <span className="text-accent font-medium">{post.category.name}</span>
                    )}
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>•</span>
                    <span>{post.readingTimeMin || 4} min read</span>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors sm:text-xl">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="pt-2 text-xs font-medium text-accent inline-flex items-center gap-1">
                    <span>Read write-up</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
