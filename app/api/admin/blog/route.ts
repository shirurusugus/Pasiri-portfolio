import { NextRequest, NextResponse } from "next/server";
import { prisma, createSafeRevision } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { BlogPostSchema } from "@/lib/validation/schemas";
import { calculateReadingTime } from "@/lib/utils";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    });
    const categories = await prisma.blogCategory.findMany();
    return NextResponse.json({ posts, categories });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { timelineData, tags, ...postData } = body;

    const parseResult = BlogPostSchema.safeParse({ ...postData, tags });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const readingTimeMin = calculateReadingTime(parseResult.data.rawContent || parseResult.data.excerpt);

    const created = await prisma.blogPost.create({
      data: {
        title: parseResult.data.title,
        slug: parseResult.data.slug,
        excerpt: parseResult.data.excerpt,
        coverImage: parseResult.data.coverImage,
        author: parseResult.data.author,
        categoryId: parseResult.data.categoryId,
        readingTimeMin,
        status: parseResult.data.status,
        featured: parseResult.data.featured,
        publishedAt: parseResult.data.status === "PUBLISHED" ? new Date() : null,
        seoTitle: parseResult.data.seoTitle,
        seoDescription: parseResult.data.seoDescription,
        rawContent: parseResult.data.rawContent,
      },
    });

    if (timelineData && timelineData.steps && timelineData.steps.length > 0) {
      await prisma.blogBlock.create({
        data: {
          postId: created.id,
          type: "process_timeline",
          order: 1,
          data: JSON.stringify(timelineData),
        },
      });
    }

    await createSafeRevision({
      entityType: "BlogPost",
      entityId: created.id,
      version: 1,
      title: created.title,
      snapshot: JSON.stringify({ ...created, timelineData }),
      authorId: session.userId,
    });

    return NextResponse.json({ success: true, post: created });
  } catch (error: any) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ error: error.message || "Failed to create article" }, { status: 500 });
  }
}
