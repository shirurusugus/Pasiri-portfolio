import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  try {
    if (!q) {
      // Default top suggestions
      const [projects, activities, artworks, writeups] = await Promise.all([
        prisma.project.findMany({
          where: { status: "PUBLISHED" },
          take: 3,
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, category: true, slug: true },
        }),
        prisma.activity.findMany({
          where: { status: "PUBLISHED" },
          take: 3,
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, category: true, slug: true, organization: true },
        }),
        prisma.artwork.findMany({
          where: { status: "PUBLISHED" },
          take: 3,
          orderBy: { sortOrder: "asc" },
          select: { id: true, title: true, medium: true, slug: true, category: { select: { name: true } } },
        }),
        prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          take: 2,
          orderBy: { publishedAt: "desc" },
          select: { id: true, title: true, slug: true, category: { select: { name: true } } },
        }),
      ]);

      const items = [
        ...projects.map((p) => ({
          id: p.id,
          title: p.title,
          category: `Project • ${p.category}`,
          href: `/projects/${p.slug}`,
          type: "project",
        })),
        ...activities.map((a) => ({
          id: a.id,
          title: a.title,
          category: a.organization ? `${a.category} • ${a.organization}` : a.category,
          href: `/activities/${a.slug}`,
          type: "activity",
        })),
        ...artworks.map((art) => ({
          id: art.id,
          title: art.title,
          category: art.category?.name ? `Artwork • ${art.category.name}` : `Artwork • ${art.medium || "Digital"}`,
          href: `/digital-art/${art.slug}`,
          type: "artwork",
        })),
        ...writeups.map((w) => ({
          id: w.id,
          title: w.title,
          category: w.category?.name ? `Write-up • ${w.category.name}` : "Write-up",
          href: `/write-ups/${w.slug}`,
          type: "writeup",
        })),
      ];

      return NextResponse.json({ items });
    }

    // Search query across projects, activities, artworks & writeups
    const [projects, activities, artworks, writeups] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { shortSummary: { contains: q } },
            { category: { contains: q } },
            { tags: { contains: q } },
            { technologies: { contains: q } },
            { tools: { contains: q } },
            { problem: { contains: q } },
          ],
        },
        take: 3,
        select: { id: true, title: true, category: true, slug: true },
      }),
      prisma.activity.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { shortSummary: { contains: q } },
            { category: { contains: q } },
            { organization: { contains: q } },
            { role: { contains: q } },
            { location: { contains: q } },
            { skillsGained: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        take: 3,
        select: { id: true, title: true, category: true, slug: true, organization: true },
      }),
      prisma.artwork.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { medium: { contains: q } },
            { software: { contains: q } },
            { tags: { contains: q } },
          ],
        },
        take: 3,
        select: { id: true, title: true, medium: true, slug: true, category: { select: { name: true } } },
      }),
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        take: 3,
        select: { id: true, title: true, slug: true, category: { select: { name: true } } },
      }),
    ]);

    const items = [
      ...projects.map((p) => ({
        id: p.id,
        title: p.title,
        category: `Project • ${p.category}`,
        href: `/projects/${p.slug}`,
        type: "project",
      })),
      ...activities.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.organization ? `${a.category} • ${a.organization}` : `Activity • ${a.category}`,
        href: `/activities/${a.slug}`,
        type: "activity",
      })),
      ...artworks.map((art) => ({
        id: art.id,
        title: art.title,
        category: art.category?.name ? `Artwork • ${art.category.name}` : `Artwork • ${art.medium || "Digital"}`,
        href: `/digital-art/${art.slug}`,
        type: "artwork",
      })),
      ...writeups.map((w) => ({
        id: w.id,
        title: w.title,
        category: w.category?.name ? `Write-up • ${w.category.name}` : "Write-up",
        href: `/write-ups/${w.slug}`,
        type: "writeup",
      })),
    ];

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ items: [] });
  }
}
